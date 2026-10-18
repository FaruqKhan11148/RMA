const Order = require('../../../models/Order');
const DeliveryPerson = require('../../../models/DeliveryPerson');

const {
  createAndSendNotification,
} = require('../../../services/notificationService');

const {
  getActiveDeliveryOrderCount,
  MAX_ACTIVE_ORDERS_PER_TRIP,
  refreshDeliveryAvailability,
  withDeliveryAssignmentLock,
} = require('../../../services/deliveryWorkload.service');

const {
  offerRmaOrderToNextPartner,
} = require('../../../services/rmaDispatchService');

const refreshRmaDeliveryPersonAvailability = async (deliveryPersonId) => {
  const deliveryPerson = await DeliveryPerson.findById(deliveryPersonId);

  if (!deliveryPerson || deliveryPerson.deliveryType !== 'RMA') {
    return null;
  }

  // Never automatically bring a manually offline DP online.
  if (deliveryPerson.availabilityStatus === 'OFFLINE') {
    return 'OFFLINE';
  }

  const activeOrderCount = await Order.countDocuments({
    deliveryPersonId: deliveryPerson._id,
    orderType: 'delivery',
    deliveryAssignmentStatus: 'ACCEPTED',
    status: { $in: ['Ready', 'OutForDelivery'] },
  });

  const nextStatus =
    activeOrderCount >= MAX_ACTIVE_ORDERS_PER_TRIP ? 'BUSY' : 'AVAILABLE';

  if (deliveryPerson.availabilityStatus !== nextStatus) {
    deliveryPerson.availabilityStatus = nextStatus;
    deliveryPerson.lastAvailabilityChangedAt = new Date();

    await deliveryPerson.save();
  }

  return nextStatus;
};

// ==========================================
// COLLECT DELIVERY ORDER
// ==========================================

const collectDeliveryOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const deliveryPerson = await DeliveryPerson.findById(
      req.deliveryPerson._id,
    );

    if (!deliveryPerson) {
      return res.status(404).json({
        message: 'Delivery partner not found',
      });
    }

    if (!deliveryPerson.isActive) {
      return res.status(403).json({
        message: 'Your delivery partner account is inactive',
      });
    }

    if (deliveryPerson.applicationStatus !== 'APPROVED') {
      return res.status(403).json({
        message: 'Your delivery partner application is not approved',
      });
    }

    const order = await Order.findOne({
      orderId,
      deliveryPersonId: deliveryPerson._id,
      orderType: 'delivery',
    });

    if (!order) {
      return res.status(404).json({
        message: 'Delivery order not found',
      });
    }

    if (order.deliveryAssignmentStatus !== 'ACCEPTED') {
      return res.status(400).json({
        message: 'You must accept this delivery before collecting it',
      });
    }

    if (order.rmaCollectionPayment?.status !== 'CONFIRMED') {
      return res.status(403).json({
        code: 'RMA_PAYMENT_NOT_CONFIRMED',
        message:
          'RMA must verify the payment before you can collect this order.',
        rmaCollectionPaymentStatus:
          order.rmaCollectionPayment?.status || 'PENDING',
      });
    }

    if (order.deliveryPickupStatus === 'COLLECTED') {
      return res.status(400).json({
        message: 'This order has already been collected',
      });
    }

    if (order.deliveryPickupStatus !== 'PENDING') {
      return res.status(400).json({
        message: 'This order is not ready for collection',
      });
    }

    if (order.status !== 'Ready') {
      return res.status(400).json({
        message: `This order cannot be collected. Current status: ${order.status}`,
      });
    }

    if (
      !order.pickupLocation ||
      order.pickupLocation.latitude == null ||
      order.pickupLocation.longitude == null
    ) {
      return res.status(400).json({
        message: 'Shop pickup location is not available',
      });
    }

    if (
      !order.deliveryLocation ||
      order.deliveryLocation.latitude == null ||
      order.deliveryLocation.longitude == null
    ) {
      return res.status(400).json({
        message: 'Customer delivery location is not available',
      });
    }

    const now = new Date();

    /*
     * Calculate the estimated delivery time from
     * the shop pickup location to the customer location.
     */
    let estimatedDeliveryMinutes = null;
    let estimatedDeliveryAt = null;

    try {
      const routingResponse = await fetch(
        'https://api.heigit.org/openrouteservice/v2/directions/driving-car/geojson',
        {
          method: 'POST',
          headers: {
            Authorization: process.env.ORS_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            coordinates: [
              [
                Number(order.pickupLocation.longitude),
                Number(order.pickupLocation.latitude),
              ],
              [
                Number(order.deliveryLocation.longitude),
                Number(order.deliveryLocation.latitude),
              ],
            ],
          }),
        },
      );

      const routingData = await routingResponse.json();

      if (!routingResponse.ok) {
        console.error('HEIGIT ETA routing error:', routingData);
      } else if (
        routingData.features &&
        routingData.features.length &&
        routingData.features[0].properties &&
        routingData.features[0].properties.summary
      ) {
        const durationSeconds =
          routingData.features[0].properties.summary.duration;

        const routeMinutes = Math.ceil(durationSeconds / 60);

        // Small buffer for traffic, signals, parking, etc.
        const deliveryBufferMinutes = 3;

        estimatedDeliveryMinutes = routeMinutes + deliveryBufferMinutes;

        estimatedDeliveryAt = new Date(
          now.getTime() + estimatedDeliveryMinutes * 60 * 1000,
        );
      }
    } catch (routingError) {
      console.error(
        'Failed to calculate estimated delivery time:',
        routingError.message,
      );
    }

    order.deliveryPickupStatus = 'COLLECTED';
    order.collectedAt = now;

    order.status = 'OutForDelivery';
    order.outForDeliveryAt = now;

    order.estimatedDeliveryMinutes = estimatedDeliveryMinutes;
    order.estimatedDeliveryAt = estimatedDeliveryAt;

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    order.deliveryOtp = otp;
    order.deliveryOtpGeneratedAt = now;
    order.otpVerified = false;

    await order.save();

    let availabilityStatus = deliveryPerson.availabilityStatus;

    if (deliveryPerson.deliveryType === 'RMA') {
      const availability = await refreshDeliveryAvailability(
        deliveryPerson._id,
      );

      availabilityStatus = availability.availabilityStatus;
    }

    if (order.customerId) {
      try {
        await createAndSendNotification({
          recipientType: 'customer',
          recipientId: order.customerId,
          type: 'ORDER_OUT_FOR_DELIVERY',
          title: 'Order On The Way',
          message: `Your order ${order.orderId} is out for delivery.`,
          orderId: order.orderId,
          data: {
            screen: 'order-status',
            orderId: order.orderId,
          },
        });
      } catch (notificationError) {
        console.error(
          'Customer delivery notification failed:',
          notificationError,
        );
      }
    }

    try {
      await createAndSendNotification({
        recipientType: 'owner',
        recipientId: order.ownerId,
        type: 'ORDER_COLLECTED',
        title: 'Order Collected',
        message: `Delivery partner collected order ${order.orderId}.`,
        orderId: order.orderId,
        data: {
          screen: 'orders',
          orderId: order.orderId,
        },
      });
    } catch (notificationError) {
      console.error('Owner collection notification failed:', notificationError);
    }

    return res.status(200).json({
      success: true,
      message: 'Order collected successfully',
      order,
      availabilityStatus,
    });
  } catch (error) {
    console.error('Collect delivery order failed:', error.message);

    return res.status(500).json({
      message: 'Server error',
    });
  }
};

// ==========================================
// ACCEPT DELIVERY ASSIGNMENT
// ==========================================

const acceptDeliveryAssignment = async (req, res) => {
  try {
    const { orderId } = req.params;

    const deliveryPerson = await DeliveryPerson.findById(
      req.deliveryPerson._id,
    );

    if (!deliveryPerson) {
      return res.status(404).json({
        message: 'Delivery partner not found',
      });
    }

    if (!deliveryPerson.isActive) {
      return res.status(403).json({
        message: 'Your delivery partner account is inactive',
      });
    }

    if (deliveryPerson.applicationStatus !== 'APPROVED') {
      return res.status(403).json({
        message: 'Your delivery partner application is not approved',
      });
    }

    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({
        message: 'Order not found',
      });
    }

    // ==========================================
    // VERIFY ASSIGNMENT
    // ==========================================

    if (
      !order.deliveryPersonId ||
      String(order.deliveryPersonId) !== String(deliveryPerson._id)
    ) {
      return res.status(403).json({
        message: 'This delivery assignment does not belong to you',
      });
    }

    if (order.deliveryAssignmentStatus !== 'PENDING') {
      return res.status(400).json({
        message: 'This delivery assignment is no longer pending',
      });
    }

    if (order.deliveryAssignmentType !== deliveryPerson.deliveryType) {
      return res.status(403).json({
        message: 'This delivery assignment is not valid for your delivery type',
      });
    }

    if (order.status !== 'Ready') {
      return res.status(400).json({
        message: `This order is no longer ready for delivery. Current status: ${order.status}`,
      });
    }

    // ==========================================
    // VALIDATE DELIVERY PARTNER UPI
    // ==========================================

    const deliveryPartnerUpiId = deliveryPerson.bankAccount?.paymentUpiId
      ?.trim()
      .toLowerCase();

    if (!deliveryPartnerUpiId) {
      return res.status(400).json({
        code: 'DELIVERY_PARTNER_UPI_REQUIRED',
        message:
          'Please add your UPI ID to your delivery partner profile before accepting deliveries.',
      });
    }

    // ==========================================
    // VALIDATE DELIVERY CHARGE
    // ==========================================

    const deliveryCharge = Number(order.deliveryCharge);

    if (!Number.isFinite(deliveryCharge) || deliveryCharge < 0) {
      return res.status(400).json({
        message: 'The delivery charge for this order is invalid.',
      });
    }

    // ==========================================
    // RMA DP AVAILABILITY CHECK
    // ==========================================

    if (deliveryPerson.deliveryType === 'RMA') {
      if (!['AVAILABLE', 'BUSY'].includes(deliveryPerson.availabilityStatus)) {
        return res.status(409).json({
          message: 'You are no longer available for this delivery',
        });
      }

      const latitude = deliveryPerson.currentLocation?.latitude;
      const longitude = deliveryPerson.currentLocation?.longitude;
      const locationUpdatedAt = deliveryPerson.currentLocation?.updatedAt;

      if (typeof latitude !== 'number' || typeof longitude !== 'number') {
        return res.status(409).json({
          message: 'Your current location is unavailable',
        });
      }

      if (
        !locationUpdatedAt ||
        Date.now() - new Date(locationUpdatedAt).getTime() > 10 * 60 * 1000
      ) {
        return res.status(409).json({
          message: 'Your current location is outdated',
        });
      }
    }

    // ==========================================
    // CHECK ACTIVE ORDER CAPACITY
    // ==========================================

    if (deliveryPerson.deliveryType === 'RMA') {
      const activeOrderCount =
        (await getActiveDeliveryOrderCount(deliveryPerson._id)) -
        (order.deliveryAssignmentStatus === 'ACCEPTED' &&
        ['Ready', 'OutForDelivery'].includes(order.status)
          ? 1
          : 0);

      if (activeOrderCount >= MAX_ACTIVE_ORDERS_PER_TRIP) {
        return res.status(409).json({
          message: 'You have reached the maximum active-order capacity',
          activeOrderCount,
          maxActiveOrders: MAX_ACTIVE_ORDERS_PER_TRIP,
        });
      }
    }

    // ==========================================
    // ACCEPT ASSIGNMENT
    // ==========================================

    const now = new Date();

    order.deliveryAssignmentStatus = 'ACCEPTED';

    // DP accepted the order but has not collected it.
    order.deliveryPickupStatus = 'PENDING';
    order.status = 'Ready';

    // ==========================================
    // INITIALIZE DELIVERY-CHARGE PAYMENT
    // ==========================================

    // Snapshot the assigned DP's UPI ID and this
    // order's delivery charge for payment.
    //
    // The owner pays the DP directly using a UPI app.
    // The DP must verify the incoming payment manually.

    order.deliveryChargePayment = {
      status: 'PENDING',
      amount: deliveryCharge,
      upiId: deliveryPartnerUpiId,
      reference: null,
      requestedAt: now,
      ownerMarkedPaidAt: null,
      confirmedAt: null,
      confirmedBy: null,
    };

    // ==========================================
    // RESET DELIVERY OTP
    // ==========================================

    // Generate the customer delivery OTP only after
    // the DP actually collects the order.
    order.deliveryOtp = null;
    order.deliveryOtpGeneratedAt = null;
    order.otpVerified = false;

    // ==========================================
    // UPDATE DP AVAILABILITY
    // ==========================================

    await order.save();

    let availabilityStatus = deliveryPerson.availabilityStatus;

    if (deliveryPerson.deliveryType === 'RMA') {
      const availability = await refreshDeliveryAvailability(
        deliveryPerson._id,
      );

      availabilityStatus = availability.availabilityStatus;
    } else {
      // Keep existing SHOP delivery-partner behavior.
      deliveryPerson.availabilityStatus = 'BUSY';
      deliveryPerson.lastAvailabilityChangedAt = now;

      await deliveryPerson.save();

      availabilityStatus = deliveryPerson.availabilityStatus;
    }

    // ==========================================
    // NOTIFY OWNER
    // ==========================================

    try {
      await createAndSendNotification({
        recipientType: 'owner',
        recipientId: order.ownerId,
        type: 'DELIVERY_ASSIGNMENT_ACCEPTED',
        title: 'Delivery Accepted',
        message: `Delivery partner accepted order ${order.orderId}. Delivery charge: ₹${deliveryCharge.toFixed(2)}.`,
        orderId: order.orderId,
        data: {
          screen: 'orders',
          orderId: order.orderId,
          assignmentStatus: 'ACCEPTED',
          deliveryAssignmentType: order.deliveryAssignmentType,
          deliveryPersonId: deliveryPerson.deliveryPersonId,
          deliveryPersonName: deliveryPerson.name,
          deliveryPersonPhone: deliveryPerson.phone,
          deliveryCharge: String(deliveryCharge),
          deliveryChargePaymentStatus: 'PENDING',
        },
      });
    } catch (notificationError) {
      console.error(
        'Owner delivery acceptance notification failed:',
        notificationError,
      );
    }

    // ==========================================
    // RESPONSE
    // ==========================================

    return res.status(200).json({
      success: true,
      message: 'Delivery accepted successfully',
      order,
      availabilityStatus,
      deliveryChargePayment: {
        status: order.deliveryChargePayment.status,
        amount: order.deliveryChargePayment.amount,
        upiId: order.deliveryChargePayment.upiId,
      },
    });
  } catch (error) {
    console.error('Accept delivery assignment failed:', error);

    return res.status(500).json({
      message: 'Server error',
    });
  }
};

// ==========================================
// REJECT DELIVERY ASSIGNMENT
// ==========================================

const rejectDeliveryAssignment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const deliveryPerson = req.deliveryPerson;

    // ==========================================
    // VERIFY DELIVERY PARTNER
    // ==========================================

    if (!deliveryPerson) {
      return res.status(401).json({
        message: 'Delivery partner authentication required',
      });
    }

    if (!deliveryPerson.isActive) {
      return res.status(403).json({
        message: 'Your delivery partner account is inactive',
      });
    }

    if (deliveryPerson.applicationStatus !== 'APPROVED') {
      return res.status(403).json({
        message: 'Your delivery partner application is not approved',
      });
    }

    // ==========================================
    // FIND ORDER
    // ==========================================

    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({
        message: 'Order not found',
      });
    }

    // ==========================================
    // VERIFY ASSIGNMENT
    // ==========================================

    if (
      !order.deliveryPersonId ||
      String(order.deliveryPersonId) !== String(deliveryPerson._id)
    ) {
      return res.status(403).json({
        message: 'This delivery assignment does not belong to you',
      });
    }

    if (order.deliveryAssignmentStatus !== 'PENDING') {
      return res.status(400).json({
        message: 'This delivery assignment is no longer pending',
      });
    }

    if (order.deliveryAssignmentType !== deliveryPerson.deliveryType) {
      return res.status(403).json({
        message: 'This delivery assignment is not valid for your delivery type',
      });
    }

    if (order.status !== 'Ready') {
      return res.status(400).json({
        message: `This order is no longer ready for delivery. Current status: ${order.status}`,
      });
    }

    // ==========================================
    // CHECK DELIVERY TYPE
    // ==========================================

    const isRmaAssignment = order.deliveryAssignmentType === 'RMA';

    // ==========================================
    // REJECT CURRENT ASSIGNMENT
    // ==========================================

    order.deliveryAssignmentStatus = 'REJECTED';

    // Clear the current DP so the order is not
    // still considered assigned to this partner.
    order.deliveryPersonId = null;

    // No collection happened.
    order.deliveryPickupStatus = 'PENDING';

    // Keep order Ready because it still needs
    // another delivery partner.
    order.status = 'Ready';

    await order.save();

    // ==========================================
    // MAKE CURRENT DP AVAILABLE AGAIN
    // ==========================================

    if (isRmaAssignment) {
      // Recalculate availability using the shared six-order rule.
      const availability = await refreshDeliveryAvailability(
        deliveryPerson._id,
      );

      // Find the next eligible RMA delivery partner.
      const dispatchResult = await offerRmaOrderToNextPartner(order, [
        deliveryPerson._id,
      ]);

      // ==========================================
      // NEXT PARTNER FOUND
      // ==========================================

      if (dispatchResult.success) {
        return res.status(200).json({
          success: true,
          message: 'Delivery assignment rejected. Finding another partner.',
          dispatchStatus: dispatchResult.status,
        });
      }

      // ==========================================
      // NO PARTNER AVAILABLE
      // ==========================================

      return res.status(200).json({
        success: true,
        message:
          'Delivery assignment rejected. No other RMA delivery partner is currently available.',
        dispatchStatus: dispatchResult.status,
      });
    }

    // ==========================================
    // SHOP DELIVERY REJECTION
    // ==========================================

    deliveryPerson.availabilityStatus = 'AVAILABLE';
    deliveryPerson.lastAvailabilityChangedAt = new Date();

    await deliveryPerson.save();

    // Notify owner only for SHOP delivery.
    try {
      await createAndSendNotification({
        recipientType: 'owner',
        recipientId: order.ownerId,
        type: 'DELIVERY_ASSIGNMENT_REJECTED',
        title: 'Delivery Assignment Rejected',
        message: `Delivery partner rejected order ${order.orderId}.`,
        orderId: order.orderId,
        data: {
          screen: 'owner-orders',
          orderId: order.orderId,
          assignmentStatus: 'REJECTED',
          deliveryAssignmentType: 'SHOP',
        },
      });
    } catch (notificationError) {
      console.error(
        'Shop delivery rejection notification failed:',
        notificationError,
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Delivery assignment rejected successfully',
      dispatchStatus: 'REJECTED',
    });
  } catch (error) {
    console.error('Reject delivery assignment failed:', error);

    return res.status(500).json({
      message: 'Server error',
    });
  }
};

// ==========================================
// GET PENDING DELIVERY ASSIGNMENTS
// ==========================================

const getPendingDeliveryAssignments = async (req, res) => {
  try {
    const deliveryPersonId = req.deliveryPerson._id;

    const orders = await Order.find({
      deliveryPersonId,
      deliveryAssignmentStatus: 'PENDING',
      status: 'Ready',
      orderType: 'delivery',
    })
      .populate('ownerId', 'ownerName shopName phone')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      assignments: orders,
    });
  } catch (error) {
    console.error('Get pending delivery assignments failed:', error.message);

    return res.status(500).json({
      message: 'Server error',
    });
  }
};

// ==========================================
// GET RMA COLLECTION PAYMENT DETAILS
// ==========================================

const getDeliveryChargePayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const deliveryPersonId = req.deliveryPerson?._id;

    if (!deliveryPersonId) {
      return res.status(401).json({
        message: 'Delivery partner authentication required',
      });
    }

    const deliveryPerson = await DeliveryPerson.findById(deliveryPersonId);

    if (!deliveryPerson) {
      return res.status(404).json({
        message: 'Delivery partner not found',
      });
    }

    if (
      !deliveryPerson.isActive ||
      deliveryPerson.applicationStatus !== 'APPROVED'
    ) {
      return res.status(403).json({
        message: 'Your delivery partner account is not approved and active',
      });
    }

    const order = await Order.findOne({
      orderId,
      deliveryPersonId: deliveryPerson._id,
      orderType: 'delivery',
    }).select(
      'orderId status subtotal deliveryCharge deliveryAssignmentType deliveryAssignmentStatus deliveryPickupStatus rmaCollectionPayment',
    );

    if (!order) {
      return res.status(404).json({
        message: 'Assigned delivery order not found',
      });
    }

    if (
      order.deliveryAssignmentType !== 'RMA' ||
      order.deliveryAssignmentStatus !== 'ACCEPTED'
    ) {
      return res.status(400).json({
        message: 'An accepted RMA delivery assignment is required',
      });
    }

    // Read the RMA UPI ID from the backend environment.
    const rmaUpiId = process.env.RMA_COLLECTION_UPI_ID?.trim();

    if (!rmaUpiId) {
      console.error(
        'RMA_COLLECTION_UPI_ID is missing from the backend environment',
      );

      return res.status(503).json({
        success: false,
        message: 'RMA payment configuration is unavailable',
      });
    }

    const subtotal = Number(order.subtotal);
    const deliveryCharge = Number(order.deliveryCharge);

    if (
      !Number.isFinite(subtotal) ||
      subtotal < 0 ||
      !Number.isFinite(deliveryCharge) ||
      deliveryCharge < 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order payment amounts',
      });
    }

    // RMA collects the delivery charge plus 2.5% of the item subtotal.
    const rmaFee = Math.round(subtotal * 0.025 * 100) / 100;
    const amount = Math.round((deliveryCharge + rmaFee) * 100) / 100;

    let payment = order.rmaCollectionPayment;

    // Initialize payment details if they are missing or invalid.
    if (!payment) {
      order.rmaCollectionPayment = {
        status: 'PENDING',
        amount,
        upiId: rmaUpiId,
        reference: null,
        requestedAt: new Date(),
        ownerMarkedPaidAt: null,
        confirmedAt: null,
        confirmedBy: null,
      };

      await order.save();
      payment = order.rmaCollectionPayment;
    } else {
      const paymentStatus = payment.status || 'PENDING';

      // Only refresh payment configuration while it is still pending.
      // Never overwrite a payment already marked as sent or confirmed.
      if (paymentStatus === 'PENDING') {
        const needsUpdate =
          !payment.upiId ||
          Number(payment.amount) <= 0 ||
          payment.upiId !== rmaUpiId ||
          Number(payment.amount) !== amount;

        if (needsUpdate) {
          payment.amount = amount;
          payment.upiId = rmaUpiId;
          payment.requestedAt = payment.requestedAt || new Date();

          await order.save();
        }
      }

      payment = order.rmaCollectionPayment;
    }

    return res.status(200).json({
      success: true,
      payment: {
        orderId: order.orderId,
        amount: Number(payment.amount || 0),
        upiId: payment.upiId || null,
        status: payment.status || 'PENDING',
        reference: payment.reference || null,
        ownerMarkedPaidAt: payment.ownerMarkedPaidAt || null,
        confirmedAt: payment.confirmedAt || null,
      },
    });
  } catch (error) {
    console.error('Get RMA collection payment failed:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to load RMA collection payment details',
    });
  }
};

module.exports = {
  acceptDeliveryAssignment,
  rejectDeliveryAssignment,
  getPendingDeliveryAssignments,
  collectDeliveryOrder,
  getDeliveryChargePayment,
};
