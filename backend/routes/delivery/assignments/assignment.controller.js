const Order = require('../../../models/Order');
const DeliveryPerson = require('../../../models/DeliveryPerson');

const {
  createAndSendNotification,
} = require('../../../services/notificationService');

const {
  offerRmaOrderToNextPartner,
} = require('../../../services/rmaDispatchService');

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
    // RMA DP AVAILABILITY CHECK
    // ==========================================

    if (deliveryPerson.deliveryType === 'RMA') {
      if (deliveryPerson.availabilityStatus !== 'AVAILABLE') {
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
    // ACCEPT ASSIGNMENT
    // ==========================================

    const now = new Date();

    order.deliveryAssignmentStatus = 'ACCEPTED';

    // IMPORTANT:
    // DP has accepted the job, but has NOT collected
    // the order from the shop yet.
    order.deliveryPickupStatus = 'PENDING';

    // Keep the order in Ready state until the DP
    // actually collects it from the shop.
    order.status = 'Ready';

    // No delivery OTP yet.
    // OTP will be generated after "I've Collected".

    order.deliveryOtp = null;
    order.deliveryOtpGeneratedAt = null;
    order.otpVerified = false;

    // DP is now busy.
    deliveryPerson.availabilityStatus = 'BUSY';
    deliveryPerson.lastAvailabilityChangedAt = now;

    await deliveryPerson.save();
    await order.save();

    // ==========================================
    // NOTIFY OWNER
    // ==========================================

    try {
      await createAndSendNotification({
        recipientType: 'owner',
        recipientId: order.ownerId,
        type: 'DELIVERY_ASSIGNMENT_ACCEPTED',
        title: 'Delivery Accepted',
        message: `Delivery partner accepted order ${order.orderId}.`,
        orderId: order.orderId,
        data: {
          screen: 'orders',
          orderId: order.orderId,
          assignmentStatus: 'ACCEPTED',
          deliveryAssignmentType: order.deliveryAssignmentType,
          deliveryPersonId: deliveryPerson.deliveryPersonId,
          deliveryPersonName: deliveryPerson.name,
          deliveryPersonPhone: deliveryPerson.phone,
        },
      });
    } catch (notificationError) {
      console.error(
        'Owner delivery acceptance notification failed:',
        notificationError,
      );
    }

    // // ==========================================
    // // NOTIFY CUSTOMER
    // // ==========================================

    // if (order.customerId) {
    //   try {
    //     await createAndSendNotification({
    //       recipientType: 'customer',
    //       recipientId: order.customerId,
    //       type: 'ORDER_OUT_FOR_DELIVERY',
    //       title: 'Order On The Way',
    //       message: `Your order ${order.orderId} is out for delivery.`,
    //       orderId: order.orderId,
    //       data: {
    //         screen: 'order-status',
    //         orderId: order.orderId,
    //       },
    //     });
    //   } catch (notificationError) {
    //     console.error(
    //       'Customer delivery notification failed:',
    //       notificationError,
    //     );
    //   }
    // }

    return res.status(200).json({
      success: true,
      message: 'Delivery accepted successfully',
      order,
      availabilityStatus: deliveryPerson.availabilityStatus,
    });
  } catch (error) {
    console.error('Accept delivery assignment failed:', error.message);

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
      deliveryPerson.availabilityStatus = 'AVAILABLE';
      deliveryPerson.lastAvailabilityChangedAt = new Date();

      await deliveryPerson.save();

      // ==========================================
      // FIND NEXT RMA PARTNER
      // ==========================================

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

module.exports = {
  acceptDeliveryAssignment,
  rejectDeliveryAssignment,
  getPendingDeliveryAssignments,
  collectDeliveryOrder,
};
