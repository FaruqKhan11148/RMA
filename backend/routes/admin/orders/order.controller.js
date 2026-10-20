const mongoose = require('mongoose');
const Order = require('../../../models/Order');
const DeliveryPerson = require('../../../models/DeliveryPerson');
const DeliveryWalletTransaction = require('../../../models/DeliveryWalletTransaction');
const TestBankAccount = require('../../../models/TestBankAccount');

const {
  confirmDirectUpiRmaCollection,
} = require('../../../services/testBank/testBankLedger.service');

// ============================================================
// DISTANCE CALCULATOR
// Returns straight-line distance in KM
// ============================================================

const calculateDistanceKm = (latitude1, longitude1, latitude2, longitude2) => {
  const toRadians = (degrees) => (degrees * Math.PI) / 180;

  const earthRadiusKm = 6371;

  const latitudeDifference = toRadians(latitude2 - latitude1);
  const longitudeDifference = toRadians(longitude2 - longitude1);

  const a =
    Math.sin(latitudeDifference / 2) * Math.sin(latitudeDifference / 2) +
    Math.cos(toRadians(latitude1)) *
      Math.cos(toRadians(latitude2)) *
      Math.sin(longitudeDifference / 2) *
      Math.sin(longitudeDifference / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
};

// ============================================================
// GET ALL ORDERS FOR ADMIN
// ============================================================

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('ownerId', 'ownerName shopName phone shopId')
      .populate(
        'deliveryPersonId',
        'name phone deliveryType applicationStatus isActive availabilityStatus currentLocation',
      )
      .select(
        [
          'orderId',
          'ownerId',
          'customer',
          'orderType',
          'deliveryAssignmentType',
          'deliveryPersonId',
          'deliveryAssignmentStatus',
          'deliveryPickupStatus',
          'collectedAt',
          'pickupLocation',
          'deliveryLocation',
          'deliveryDistance',
          'items',
          'totalItems',
          'subtotal',
          'totalPrice',
          'deliveryCharge',
          'deliveryRiderAmount',
          'status',

          // Payment
          'paymentStatus',
          'paymentMethod',
          'onlinePaymentMethod',
          'paymentId',
          'paymentOrderId',
          'paidAt',

          'rmaFee',
          'ownerAmount',
          'rmaCollectionPayment',

          // OTP / Delivery
          'otpVerified',
          'deliveryOtpGeneratedAt',

          // Timeline
          'acceptedAt',
          'preparingAt',
          'readyAt',
          'outForDeliveryAt',
          'completedAt',
          'rejectedAt',

          // Mongo timestamps
          'createdAt',
          'updatedAt',
        ].join(' '),
      )
      .sort({ createdAt: -1 });

    // ========================================================
    // ADMIN FINANCE DISPLAY
    //
    // RMA fee is FIXED at 2.5%.
    // ========================================================

    const ordersWithFinance = orders.map((order) => {
      const orderData = order.toObject();

      const rmaFee = Number(((order.subtotal || 0) * 0.025).toFixed(2));

      const ownerAmount = Number(
        (
          Number(order.ownerAmount ?? order.subtotal ?? 0) -
          (order.ownerAmount == null ? rmaFee : 0)
        ).toFixed(2),
      );

      return {
        ...orderData,
        rmaFee,
        ownerAmount,
      };
    });

    return res.status(200).json({
      count: ordersWithFinance.length,
      orders: ordersWithFinance,
    });
  } catch (error) {
    console.error('Admin orders fetch error:', error);

    return res.status(500).json({
      message: 'Failed to fetch orders',
    });
  }
};

// ============================================================
// GET ELIGIBLE RMA DELIVERY PARTNERS
// ============================================================

const getEligibleRmaDeliveryPartners = async (req, res) => {
  try {
    const { orderId } = req.params;

    // ========================================================
    // FIND ORDER
    // ========================================================

    const order = await Order.findOne({
      orderId,
    }).select(
      [
        'orderId',
        'orderType',
        'status',
        'deliveryAssignmentType',
        'deliveryAssignmentStatus',
        'deliveryPersonId',
        'pickupLocation',
      ].join(' '),
    );

    if (!order) {
      return res.status(404).json({
        message: 'Order not found',
      });
    }

    // ========================================================
    // ORDER VALIDATION
    // ========================================================

    if (order.orderType !== 'delivery') {
      return res.status(400).json({
        message:
          'RMA delivery partners can only be assigned to delivery orders',
      });
    }

    if (order.status !== 'Ready') {
      return res.status(400).json({
        message:
          'RMA delivery partner can only be assigned when the order is Ready',
      });
    }

    // ========================================================
    // EXISTING ASSIGNMENT CHECK
    //
    // SHOP assignment must not be overwritten by Admin RMA
    // assignment.
    // ========================================================

    if (order.deliveryAssignmentType === 'SHOP') {
      return res.status(400).json({
        message: 'This order is already assigned to a shop delivery partner',
      });
    }

    if (
      order.deliveryPersonId &&
      order.deliveryAssignmentStatus === 'ACCEPTED'
    ) {
      return res.status(400).json({
        message: 'This order already has an accepted delivery partner',
      });
    }

    // ========================================================
    // VALIDATE PICKUP LOCATION
    // ========================================================

    const pickupLatitude = Number(order.pickupLocation?.latitude);
    const pickupLongitude = Number(order.pickupLocation?.longitude);

    if (!Number.isFinite(pickupLatitude) || !Number.isFinite(pickupLongitude)) {
      return res.status(400).json({
        message: 'Order pickup location is not available',
      });
    }

    // ========================================================
    // FIND ACTIVE RMA DELIVERY PARTNERS
    // ========================================================

    const deliveryPersons = await DeliveryPerson.find({
      deliveryType: 'RMA',
      applicationStatus: 'APPROVED',
      isActive: true,
      availabilityStatus: { $in: ['AVAILABLE', 'BUSY'] },

      'currentLocation.latitude': {
        $ne: null,
      },

      'currentLocation.longitude': {
        $ne: null,
      },

      'currentLocation.updatedAt': {
        $gte: new Date(Date.now() - 10 * 60 * 1000),
      },
    }).select(
      [
        'name',
        'phone',
        'deliveryType',
        'applicationStatus',
        'isActive',
        'availabilityStatus',
        'currentLocation',
      ].join(' '),
    );

    // ========================================================
    // FIND RMA PARTNERS WHO ALREADY HAVE ACTIVE DELIVERIES
    //
    // V1 RULE:
    // One RMA delivery partner = one active delivery.
    // ========================================================

    const activeOrders = await Order.find({
      deliveryPersonId: {
        $in: deliveryPersons.map((deliveryPerson) => deliveryPerson._id),
      },
      orderType: 'delivery',
      status: 'OutForDelivery',
      deliveryAssignmentStatus: 'ACCEPTED',
      deliveryPickupStatus: 'COLLECTED',
    }).select('deliveryPersonId');

    const busyDeliveryPersonIds = new Set(
      activeOrders.map((activeOrder) =>
        activeOrder.deliveryPersonId.toString(),
      ),
    );

    // ========================================================
    // BUILD ELIGIBLE PARTNER LIST
    // ========================================================

    const eligiblePartners = deliveryPersons
      .filter(
        (deliveryPerson) =>
          !busyDeliveryPersonIds.has(deliveryPerson._id.toString()),
      )
      .map((deliveryPerson) => {
        const currentLatitude = Number(
          deliveryPerson.currentLocation?.latitude,
        );

        const currentLongitude = Number(
          deliveryPerson.currentLocation?.longitude,
        );

        const distanceToShop = calculateDistanceKm(
          currentLatitude,
          currentLongitude,
          pickupLatitude,
          pickupLongitude,
        );

        return {
          _id: deliveryPerson._id,
          name: deliveryPerson.name,
          phone: deliveryPerson.phone,
          deliveryType: deliveryPerson.deliveryType,
          applicationStatus: deliveryPerson.applicationStatus,
          isActive: deliveryPerson.isActive,
          availabilityStatus: deliveryPerson.availabilityStatus,

          currentLocation: {
            latitude: currentLatitude,
            longitude: currentLongitude,
            updatedAt: deliveryPerson.currentLocation?.updatedAt || null,
          },

          distanceToShop: Number(distanceToShop.toFixed(2)),
        };
      })
      .sort(
        (partnerA, partnerB) =>
          partnerA.distanceToShop - partnerB.distanceToShop,
      );

    // ========================================================
    // RESPONSE
    // ========================================================

    return res.status(200).json({
      orderId: order.orderId,
      count: eligiblePartners.length,
      partners: eligiblePartners,
    });
  } catch (error) {
    console.error('Admin eligible RMA delivery partners error:', error);

    return res.status(500).json({
      message: 'Failed to fetch eligible RMA delivery partners',
    });
  }
};

// ============================================================
// ASSIGN RMA DELIVERY PARTNER TO ORDER
// ============================================================

const assignRmaDeliveryPartner = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { deliveryPersonId } = req.body;

    if (!deliveryPersonId) {
      return res.status(400).json({
        message: 'Delivery partner is required',
      });
    }

    // ========================================================
    // FIND ORDER
    // ========================================================

    const order = await Order.findOne({
      orderId,
    });

    if (!order) {
      return res.status(404).json({
        message: 'Order not found',
      });
    }

    // ========================================================
    // ORDER VALIDATION
    // ========================================================

    if (order.orderType !== 'delivery') {
      return res.status(400).json({
        message: 'Only delivery orders can be assigned to an RMA partner',
      });
    }

    if (order.status !== 'Ready') {
      return res.status(400).json({
        message: 'Order must be Ready before assigning an RMA delivery partner',
      });
    }

    if (order.deliveryAssignmentType === 'SHOP') {
      return res.status(400).json({
        message: 'This order is assigned to shop delivery',
      });
    }

    if (
      order.deliveryPersonId &&
      order.deliveryAssignmentStatus === 'ACCEPTED'
    ) {
      return res.status(409).json({
        message: 'This order already has an accepted delivery partner',
      });
    }

    // ========================================================
    // FIND DELIVERY PARTNER
    // ========================================================

    const deliveryPerson = await DeliveryPerson.findOne({
      _id: deliveryPersonId,
      deliveryType: 'RMA',
    });

    if (!deliveryPerson) {
      return res.status(404).json({
        message: 'RMA delivery partner not found',
      });
    }

    // ========================================================
    // PARTNER ELIGIBILITY
    // ========================================================

    if (deliveryPerson.applicationStatus !== 'APPROVED') {
      return res.status(400).json({
        message: 'Delivery partner is not approved',
      });
    }

    if (!deliveryPerson.isActive) {
      return res.status(400).json({
        message: 'Delivery partner account is inactive',
      });
    }

    if (!['AVAILABLE', 'BUSY'].includes(deliveryPerson.availabilityStatus)) {
      return res.status(400).json({
        message: 'Delivery partner is not currently available',
      });
    }

    // ========================================================
    // GPS VALIDATION
    // ========================================================

    const partnerLatitude = Number(deliveryPerson.currentLocation?.latitude);

    const partnerLongitude = Number(deliveryPerson.currentLocation?.longitude);

    const partnerLocationUpdatedAt = deliveryPerson.currentLocation?.updatedAt;

    if (
      !Number.isFinite(partnerLatitude) ||
      !Number.isFinite(partnerLongitude) ||
      !partnerLocationUpdatedAt
    ) {
      return res.status(400).json({
        message: 'Delivery partner location is unavailable',
      });
    }

    const locationAgeMs =
      Date.now() - new Date(partnerLocationUpdatedAt).getTime();

    const maxLocationAgeMs = 10 * 60 * 1000;

    if (locationAgeMs > maxLocationAgeMs) {
      return res.status(400).json({
        message:
          'Delivery partner location is outdated. Please wait for a fresh location.',
      });
    }

    // ========================================================
    // CHECK ACTIVE ORDER CAPACITY
    // ========================================================

    const MAX_ACTIVE_ORDERS_PER_TRIP = 6;

    const activeOrderCount = await Order.countDocuments({
      deliveryPersonId: deliveryPerson._id,
      orderType: 'delivery',
      deliveryAssignmentStatus: 'ACCEPTED',
      status: { $in: ['Ready', 'OutForDelivery'] },
    });

    if (activeOrderCount >= MAX_ACTIVE_ORDERS_PER_TRIP) {
      return res.status(409).json({
        message:
          'Delivery partner has reached the maximum active-order capacity',
        activeOrderCount,
        maxActiveOrders: MAX_ACTIVE_ORDERS_PER_TRIP,
      });
    }

    // ========================================================
    // CHECK PENDING READY ASSIGNMENT
    //
    // Prevent assigning multiple Ready orders to the same
    // delivery partner before they accept.
    // ========================================================

    const pendingAssignment = await Order.findOne({
      deliveryPersonId: deliveryPerson._id,
      orderType: 'delivery',
      status: 'Ready',
      deliveryAssignmentStatus: 'PENDING',
      orderId: { $ne: order.orderId },
    }).select('orderId');

    if (pendingAssignment) {
      return res.status(409).json({
        message:
          'Delivery partner already has another pending delivery assignment',
        pendingOrderId: pendingAssignment.orderId,
      });
    }

    // ========================================================
    // ASSIGN PARTNER
    // ========================================================

    order.deliveryAssignmentType = 'RMA';
    order.deliveryPersonId = deliveryPerson._id;
    order.deliveryAssignmentStatus = 'PENDING';
    order.deliveryPickupStatus = 'PENDING';

    // Partner must accept before collection.
    order.status = 'Ready';

    // Make sure an old OTP cannot survive reassignment.
    order.deliveryOtp = null;
    order.deliveryOtpGeneratedAt = null;
    order.otpVerified = false;

    await order.save();

    // ========================================================
    // MARK PARTNER BUSY
    //
    // We use BUSY because the partner now has a pending
    // assignment and should not receive another assignment.
    // ========================================================

    deliveryPerson.availabilityStatus = 'BUSY';
    deliveryPerson.lastAvailabilityChangedAt = new Date();

    await deliveryPerson.save();

    // ========================================================
    // RESPONSE
    // ========================================================

    const updatedOrder = await Order.findOne({
      orderId,
    })
      .populate(
        'deliveryPersonId',
        'name phone deliveryType applicationStatus isActive availabilityStatus currentLocation',
      )
      .populate('ownerId', 'ownerName shopName phone shopId');

    return res.status(200).json({
      message: 'RMA delivery partner assigned successfully',
      order: updatedOrder,
    });
  } catch (error) {
    console.error('Admin RMA delivery partner assignment error:', error);

    return res.status(500).json({
      message: 'Failed to assign RMA delivery partner',
    });
  }
};

// ============================================================
// CONFIRM RMA COLLECTION PAYMENT (ADMIN ONLY)
// ============================================================

const confirmRmaCollectionPayment = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { orderId } = req.params;

    if (!req.admin?._id) {
      return res.status(401).json({
        success: false,
        message: 'Admin authentication required',
      });
    }

    let result;

    await session.withTransaction(async () => {
      const order = await Order.findOne({
        orderId,
        orderType: 'delivery',
      }).session(session);

      if (!order) {
        const error = new Error('Delivery order not found');
        error.statusCode = 404;
        throw error;
      }

      if (
        order.deliveryAssignmentType !== 'RMA' ||
        !order.deliveryPersonId ||
        order.deliveryAssignmentStatus !== 'ACCEPTED'
      ) {
        const error = new Error(
          'An accepted RMA delivery assignment is required',
        );
        error.statusCode = 400;
        throw error;
      }

      const payment = order.rmaCollectionPayment;

      if (!payment) {
        const error = new Error(
          'RMA collection payment has not been initialized',
        );
        error.statusCode = 400;
        throw error;
      }

      if (
        payment.status !== 'BOTH_MARKED_PAID' &&
        payment.status !== 'CONFIRMED'
      ) {
        const error = new Error(
          payment.status === 'DISPUTED'
            ? 'This payment is disputed and cannot be confirmed'
            : 'Both owner and assigned DP must acknowledge payment first',
        );
        error.statusCode = 400;
        throw error;
      }

      if (
        !payment.ownerMarkedPaidAt ||
        !payment.dpAcknowledgedAt ||
        !payment.dpAcknowledgedBy ||
        payment.dpAcknowledgedBy.toString() !==
          order.deliveryPersonId.toString()
      ) {
        const error = new Error(
          'Required owner and assigned DP acknowledgements are missing or invalid',
        );
        error.statusCode = 400;
        throw error;
      }

      // Admin must independently verify the actual incoming bank/UPI transfer.
      const productSubtotal = Number(
        Number(order.productSubtotal ?? order.subtotal ?? 0).toFixed(2),
      );

      const rmaFee = Number(Number(order.rmaFee ?? 0).toFixed(2));

      const dpAmount = Number(
        Number(order.deliveryRiderAmount ?? order.deliveryCharge ?? 0).toFixed(
          2,
        ),
      );

      const collectionAmount = Number(Number(payment.amount ?? 0).toFixed(2));

      if (
        !Number.isFinite(productSubtotal) ||
        !Number.isFinite(rmaFee) ||
        !Number.isFinite(dpAmount) ||
        !Number.isFinite(collectionAmount) ||
        productSubtotal <= 0 ||
        rmaFee < 0 ||
        dpAmount < 0 ||
        collectionAmount <= 0
      ) {
        const error = new Error('Invalid RMA collection payment breakdown');
        error.statusCode = 400;
        throw error;
      }

      if (Number((rmaFee + dpAmount).toFixed(2)) !== collectionAmount) {
        const error = new Error(
          'RMA fee and delivery charge do not match the collection amount',
        );
        error.statusCode = 400;
        throw error;
      }

      // Locate the exact RMA system account used by the RMA Account page.
      // Do not accidentally update a different RMA account if duplicates exist.
      const [ownerAccount, rmaAccount, dpAccount] = await Promise.all([
        TestBankAccount.findOne({
          ownerId: order.ownerId,
          accountType: 'OWNER',
          status: 'ACTIVE',
        }).session(session),

        TestBankAccount.findOne({
          accountType: 'RMA',
          accountNumber: 'RMA-SYSTEM-000001',
          status: 'ACTIVE',
        }).session(session),

        TestBankAccount.findOne({
          deliveryPersonId: order.deliveryPersonId,
          accountType: 'DELIVERY_PARTNER',
          status: 'ACTIVE',
        }).session(session),
      ]);

      if (!ownerAccount || !rmaAccount || !dpAccount) {
        const error = new Error(
          'Required active TestBank accounts are missing. Verify the owner account, RMA-SYSTEM-000001 account, and assigned DP account.',
        );
        error.statusCode = 409;
        throw error;
      }

      // Idempotently record the collection in TestBank.
      // All balance updates must happen within the same MongoDB session.
      const ledgerResult = await confirmDirectUpiRmaCollection({
        ownerAccountId: ownerAccount._id,
        rmaAccountId: rmaAccount._id,
        dpAccountId: dpAccount._id,
        amount: collectionAmount,
        fee: rmaFee,
        delivery: dpAmount,
        referenceId: order.orderId,
        metadata: {
          source: 'RMA_COLLECTION_ADMIN_CONFIRMED',
          ownerId: String(order.ownerId),
          deliveryPersonId: String(order.deliveryPersonId),
          confirmedBy: String(req.admin._id),
        },
        session,
      });

      // Preserve the existing delivery wallet earning flow.
      const earningAmount = dpAmount;

      let earning = await DeliveryWalletTransaction.findOne({
        deliveryPersonId: order.deliveryPersonId,
        orderId: order.orderId,
        type: 'ORDER_DELIVERY_EARNING',
      }).session(session);

      if (!earning && earningAmount > 0) {
        earning = new DeliveryWalletTransaction({
          deliveryPersonId: order.deliveryPersonId,
          orderId: order.orderId,
          type: 'ORDER_DELIVERY_EARNING',
          amount: earningAmount,
          status: 'PENDING',
          description: `Delivery earning for order ${order.orderId}`,
          metadata: {
            source: 'RMA_COLLECTION_ADMIN_CONFIRMED',
            rmaCollectionPaymentAmount: collectionAmount,
            confirmedBy: String(req.admin._id),
          },
        });

        await earning.save({ session });
      } else if (earning && Number(earning.amount) !== earningAmount) {
        const error = new Error(
          'Existing delivery earning does not match the order amount',
        );
        error.statusCode = 409;
        throw error;
      }

      if (payment.status !== 'CONFIRMED') {
        payment.status = 'CONFIRMED';
        payment.confirmedAt = new Date();
        payment.confirmedBy = req.admin._id;

        await order.save({ session });
      }

      result = {
        orderId: order.orderId,
        paymentStatus: payment.status,
        paymentAmount: collectionAmount,
        rmaAccountNumber: rmaAccount.accountNumber,
        earning,
        earningAmount,
        alreadyProcessed: Boolean(ledgerResult?.alreadyProcessed),
      };
    });

    return res.status(200).json({
      success: true,
      message: 'RMA collection payment verified successfully',
      orderId: result.orderId,
      paymentStatus: result.paymentStatus,
      paymentAmount: result.paymentAmount,
      rmaAccountNumber: result.rmaAccountNumber,
      dpEarning: result.earning
        ? {
            transactionId: result.earning._id,
            amount: result.earning.amount,
            status: result.earning.status,
          }
        : {
            amount: result.earningAmount,
            status: 'NOT_CREATED',
            message: 'No positive delivery earning is due for this order',
          },
      alreadyProcessed: result.alreadyProcessed,
    });
  } catch (error) {
    console.error('Admin RMA collection payment confirmation error:', error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : 'Failed to confirm RMA collection payment',
    });
  } finally {
    await session.endSession();
  }
};

module.exports = {
  getAllOrders,
  getEligibleRmaDeliveryPartners,
  assignRmaDeliveryPartner,
  confirmRmaCollectionPayment,
};
