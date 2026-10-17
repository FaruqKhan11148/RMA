const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const mongoose = require('mongoose');

const Order = require('../../../models/Order');
const Owner = require('../../../models/Owner');
const Customer = require('../../../models/Customer');
const DeliveryPerson = require('../../../models/DeliveryPerson');

const PaymentAuditLog = require('../../../models/PaymentAuditLog');
const {
  recordPaymentAudit,
  validateDirectUpiRefund,
} = require('../../../services/payments/paymentState.service');

const PaymentRefund = require('../../../models/PaymentRefund');

const {
  transitionRefund,
} = require('../../../services/payments/refund.service');

const {
  createAndSendNotification,
} = require('../../../services/notificationService');

const {
  offerRmaOrderToNextPartner,
} = require('../../../services/rmaDispatchService');

const {
  settleCompletedOrder,
} = require('../../../services/orders/settlement.service');

// ==========================================
// PAYU REFUND
// ==========================================

async function initiatePayURefund(order, refundAmount) {
  if (!order.paymentId) {
    throw new Error('PayU payment ID is missing');
  }

  if (!order.paymentOrderId) {
    throw new Error('PayU payment order ID is missing');
  }

  const payuKey = process.env.PAYU_MERCHANT_KEY;
  const payuSalt = process.env.PAYU_SALT;

  if (!payuKey || !payuSalt) {
    throw new Error('PayU credentials are not configured');
  }

  const requestedRefundAmount = Number(refundAmount);

  if (!Number.isFinite(requestedRefundAmount) || requestedRefundAmount <= 0) {
    throw new Error('Invalid refund amount');
  }

  const paidAmount = Number(order.customerPayableAmount || order.totalPrice);

  if (!Number.isFinite(paidAmount) || paidAmount <= 0) {
    throw new Error('Invalid original payment amount');
  }

  if (requestedRefundAmount > paidAmount) {
    throw new Error('Refund amount cannot exceed the original payment amount');
  }

  const finalRefundAmount = Number(requestedRefundAmount.toFixed(2));

  const refundToken = `RF${order.orderId}${Date.now()}`.slice(0, 23);

  const command = 'cancel_refund_transaction';

  // PayU refund hash:
  // sha512(key|command|var1|salt)
  const hashString = `${payuKey}|${command}|${order.paymentId}|${payuSalt}`;

  const hash = crypto.createHash('sha512').update(hashString).digest('hex');

  const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';

  const refundCallbackUrl = `${backendUrl}/api/payments/payu/refund-callback`;

  const formData = new URLSearchParams();

  formData.append('key', payuKey);
  formData.append('command', command);
  formData.append('var1', order.paymentId);
  formData.append('var2', refundToken);
  formData.append('var3', finalRefundAmount.toFixed(2));
  formData.append('var5', refundCallbackUrl);
  formData.append('hash', hash);

  const payuRefundUrl =
    process.env.PAYU_ENV === 'live'
      ? 'https://secure.payu.in/merchant/postservice.php?form=2'
      : 'https://test.payu.in/merchant/postservice.php?form=2';

  console.log('========== PAYU REFUND REQUEST ==========');

  console.log({
    orderId: order.orderId,
    paymentId: order.paymentId,
    originalPaidAmount: paidAmount.toFixed(2),
    refundAmount: finalRefundAmount.toFixed(2),
    refundToken,
    payuRefundUrl,
  });

  console.log('==========================================');

  const response = await fetch(payuRefundUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
  });

  if (!response.ok) {
    throw new Error(`PayU refund API returned HTTP ${response.status}`);
  }

  const data = await response.json();

  console.log('========== PAYU REFUND RESPONSE ==========');
  console.log(data);
  console.log('===========================================');

  if (Number(data.status) !== 1) {
    throw new Error(data.msg || 'PayU refund request failed');
  }

  return {
    refundToken,
    requestId: data.request_id || null,
    bankReferenceNumber: data.bank_ref_num || null,
    refundAmount: finalRefundAmount,
    response: data,
  };
}

// ==========================================
// DISTANCE
// ==========================================

function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const earthRadiusKm = 6371;

  const toRadians = (degrees) => (degrees * Math.PI) / 180;

  const latitudeDifference = toRadians(lat2 - lat1);
  const longitudeDifference = toRadians(lon2 - lon1);

  const a =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(longitudeDifference / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}

// ==========================================
// CREATE ORDER
// ==========================================

async function createOrder(req, res) {
  try {
    const {
      ownerId,
      customer,
      orderType,
      items,
      paymentMethod,
      deliveryLocation,
      guestId,
    } = req.body;

    if (
      !ownerId ||
      !customer ||
      !customer.name ||
      !customer.phone ||
      !orderType ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0 ||
      !['ONLINE', 'DIRECT_UPI'].includes(paymentMethod)
    ) {
      return res.status(400).json({
        message: 'Required order fields are missing',
      });
    }

    // Delivery orders must have a valid location
    if (
      orderType === 'delivery' &&
      (!deliveryLocation ||
        deliveryLocation.latitude === undefined ||
        deliveryLocation.longitude === undefined)
    ) {
      return res.status(400).json({
        message: 'Delivery location is required',
      });
    }

    const owner = await Owner.findById(ownerId);

    if (!owner) {
      return res.status(404).json({
        message: 'Shop owner not found',
      });
    }

    // ==========================================
    // SELECT SHOP PAYMENT PROVIDER
    // ==========================================

    const paymentProvider = owner.payment?.provider || 'PAYU';

    if (!['PAYU', 'CASHFREE', 'DIRECT_UPI'].includes(paymentProvider)) {
      return res.status(400).json({
        message: 'Shop payment configuration is invalid',
      });
    }

    if (paymentProvider === 'DIRECT_UPI' && !owner.payment?.upiId) {
      return res.status(400).json({
        message: 'This shop has not configured its UPI ID',
      });
    }

    // ==========================================
    // SHOP PAYMENT DETAILS
    // ==========================================

    const shopUpiId =
      paymentProvider === 'DIRECT_UPI'
        ? owner.payment.upiId.trim().toLowerCase()
        : null;

    const shopBankName =
      paymentProvider === 'DIRECT_UPI' ? owner.payment.bankName || '' : '';

    const shopBankHolderName =
      paymentProvider === 'DIRECT_UPI'
        ? owner.payment?.bankHolderName || ''
        : '';

    const shopUpiMobileNumber =
      paymentProvider === 'DIRECT_UPI'
        ? owner.payment.upiMobileNumber || ''
        : '';

    console.log('DIRECT UPI OWNER PAYMENT DEBUG:', {
      paymentProvider,
      bankName: owner.payment?.bankName,
      upiMobileNumber: owner.payment?.upiMobileNumber,
      shopBankName,
      shopUpiMobileNumber,
    });

    // ==========================================
    // CALCULATE ORDER AMOUNTS ON BACKEND
    // ==========================================

    // Find the actual products belonging to this shop
    const calculatedItems = [];

    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity < 1) {
        return res.status(400).json({
          message: 'Invalid product or quantity',
        });
      }

      const product = owner.products.find(
        (product) => product.productId === item.productId,
      );

      if (!product) {
        return res.status(400).json({
          message: `Product not found: ${item.productId}`,
        });
      }

      const price = Number(product.price);
      const quantity = Number(item.quantity);

      if (!Number.isFinite(price) || price < 0) {
        return res.status(400).json({
          message: `Invalid price for product: ${item.productId}`,
        });
      }

      calculatedItems.push({
        productId: product.productId,
        productName: product.name,
        price,
        quantity,
        unit: product.unit,
      });
    }

    // ==========================================
    // PRODUCT SUBTOTAL
    // ==========================================

    const subtotal = calculatedItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );

    const calculatedTotalItems = calculatedItems.reduce(
      (total, item) => total + item.quantity,
      0,
    );

    // ==========================================
    // DELIVERY DISTANCE & DELIVERY CHARGE
    // ==========================================

    let deliveryDistance = 0;
    let deliveryCharge = 0;

    let pickupLocation = {
      latitude: null,
      longitude: null,
      address: '',
    };

    if (orderType === 'delivery') {
      const shopLatitude = owner.location?.latitude;
      const shopLongitude = owner.location?.longitude;

      const customerLatitude = deliveryLocation?.latitude;
      const customerLongitude = deliveryLocation?.longitude;

      if (
        shopLatitude === undefined ||
        shopLatitude === null ||
        shopLongitude === undefined ||
        shopLongitude === null ||
        customerLatitude === undefined ||
        customerLatitude === null ||
        customerLongitude === undefined ||
        customerLongitude === null
      ) {
        return res.status(400).json({
          message: 'Valid shop and delivery locations are required',
        });
      }

      // ==========================================
      // SNAPSHOT SHOP PICKUP LOCATION
      // ==========================================

      pickupLocation = {
        latitude: Number(shopLatitude),
        longitude: Number(shopLongitude),
        address: owner.address || '',
      };

      deliveryDistance = calculateDistanceKm(
        shopLatitude,
        shopLongitude,
        customerLatitude,
        customerLongitude,
      );

      // ============================================================
      // RMA DELIVERY SERVICE AREA
      // Shop → Customer must be within 5 km
      // ============================================================

      if (deliveryDistance > 5) {
        return res.status(400).json({
          message: 'Delivery is available only within 5 km of this shop',
        });
      }

      // deliveryCharge = Number((18 + 8 * deliveryDistance).toFixed(2));
      deliveryCharge = Number((2 + 0 * deliveryDistance).toFixed(2));
      // deliveryCharge = 0;
    }

    // ==========================================
    // RMA PRODUCT FEE
    // ==========================================

    // RMA gets 2.5% of PRODUCT SUBTOTAL only.
    const rmaFee = Number((subtotal * 0.025).toFixed(2));

    // ==========================================
    // DELIVERY SPLIT
    // ==========================================

    // Full delivery charge belongs to the assigned
    // delivery partner.
    // 100% -> Rider / Delivery Partner
    // 0%   -> RMA
    // 0%   -> Shop Owner

    const deliveryRiderAmount = Number(deliveryCharge.toFixed(2));

    const deliveryRmaAmount = 0;

    const deliveryOwnerAmount = 0;

    // ==========================================
    // TOTAL RMA AMOUNT
    // ==========================================

    // RMA earns only the 2.5% product fee.
    // Delivery charge does not belong to RMA.

    const rmaAmount = Number((rmaFee + deliveryRmaAmount).toFixed(2));

    // ==========================================
    // TOTAL OWNER AMOUNT
    // ==========================================

    // Owner earns:
    // Product subtotal - RMA product fee
    // Delivery charge is not included.

    const ownerAmount = Number(
      (subtotal - rmaFee + deliveryOwnerAmount).toFixed(2),
    );

    // ==========================================
    // BASE CUSTOMER TOTAL
    // ==========================================

    // This is the amount before PayU charges.
    const totalPrice = Number((subtotal + deliveryCharge).toFixed(2));

    // ==========================================
    // IDENTIFY LOGGED-IN CUSTOMER
    // ==========================================

    let customerId = null;

    try {
      const token = req.cookies?.customer_token;

      if (token) {
        const decoded = jwt.verify(token, process.env.CUSTOMER_JWT_SECRET);

        const loggedInCustomer = await Customer.findById(decoded.customerId);

        if (loggedInCustomer && loggedInCustomer.isActive) {
          customerId = loggedInCustomer._id;
        }
      }
    } catch (error) {
      // Invalid/expired customer session should NOT
      // prevent guest checkout.
      console.log('No valid customer session. Creating guest order.');
    }

    const storedGuestId = customerId ? null : guestId;

    console.log('ORDER DATA BEFORE MONGODB:', {
      ownerId,
      customerId,
      customer,
      orderType,

      // Pickup location
      pickupLocation,

      // Customer delivery location
      deliveryLocation,

      items: calculatedItems,
      totalItems: calculatedTotalItems,

      // Financial breakdown
      subtotal,
      deliveryDistance,
      deliveryCharge,

      rmaFee,
      deliveryRiderAmount,
      deliveryRmaAmount,
      deliveryOwnerAmount,
      rmaAmount,
      ownerAmount,

      totalPrice,
      customerPayableAmount: paymentProvider === 'DIRECT_UPI' ? totalPrice : 0,
      paymentMethod,
    });

    // ==========================================
    // OPTIONAL CUSTOMER REFUND UPI ID
    // ==========================================

    const rawRefundUpiId = customer.refundUpiId;

    let validatedRefundUpiId = null;

    if (
      rawRefundUpiId !== undefined &&
      rawRefundUpiId !== null &&
      String(rawRefundUpiId).trim() !== ''
    ) {
      const refundUpiId = String(rawRefundUpiId).trim().toLowerCase();

      // Basic UPI ID validation; this does not verify ownership.
      const upiIdPattern = /^[a-z0-9._-]{2,256}@[a-z0-9.-]{2,64}$/i;

      if (refundUpiId.length > 100 || !upiIdPattern.test(refundUpiId)) {
        return res.status(400).json({
          message: 'Please enter a valid refund UPI ID or leave it blank.',
        });
      }

      validatedRefundUpiId = refundUpiId;
    }

    const order = await Order.create({
      orderId: `RMA${Date.now()}`,

      customerId,
      guestId: storedGuestId,

      ownerId,
      customer: {
        name: customer.name.trim(),
        phone: customer.phone.trim(),
        address: customer.address?.trim() || '',
      },

      orderType,

      // Snapshot shop pickup location
      pickupLocation,

      // Customer delivery location
      deliveryLocation,

      // Backend-calculated product data
      items: calculatedItems,
      totalItems: calculatedTotalItems,

      // Backend-calculated financial data
      subtotal,
      deliveryDistance,
      deliveryCharge,

      // RMA / Rider / Owner split
      rmaFee,
      deliveryRiderAmount,
      deliveryRmaAmount,
      deliveryOwnerAmount,
      rmaAmount,
      ownerAmount,

      // Base customer amount before PayU charges
      totalPrice,
      customerPayableAmount: paymentProvider === 'DIRECT_UPI' ? totalPrice : 0,

      // Payment configuration snapshot
      paymentProvider,
      shopUpiId,
      shopBankName,
      shopUpiMobileNumber,
      shopBankHolderName,

      ownerPaymentConfirmation: {
        status: paymentProvider === 'DIRECT_UPI' ? 'PENDING' : 'NOT_REQUIRED',
        confirmedAt: null,
        reference: null,
      },

      // Keep the existing gateway flow unchanged for now.
      paymentMethod: paymentProvider === 'DIRECT_UPI' ? 'DIRECT_UPI' : 'ONLINE',
      status: 'Pending',
    });

    // ==========================================
    // NOTIFY SHOP OWNER ABOUT NEW ORDER
    // ==========================================

    try {
      await createAndSendNotification({
        recipientType: 'owner',
        recipientId: ownerId,
        type: 'NEW_ORDER',
        title: 'New Order Received',
        message:
          `You received a new order ${order.orderId} ` +
          `from ${customer.name}.`,
        orderId: order.orderId,
        data: {
          screen: 'owner-orders',
          orderId: order.orderId,
        },
      });
    } catch (notificationError) {
      console.error('Owner new order notification failed:', notificationError);
    }

    res.status(201).json({
      message: 'Order created successfully',
      order,
    });
  } catch (error) {
    console.error('========== CREATE ORDER ERROR ==========');
    console.error(error);
    console.error('========================================');

    res.status(500).json({
      message: error.message,
    });
  }
}

async function confirmDirectUpiPayment(req, res) {
  const session = await mongoose.startSession();

  try {
    const { orderId } = req.params;
    const { reference } = req.body;

    if (reference && typeof reference !== 'string') {
      return res.status(400).json({
        message: 'Invalid payment reference',
      });
    }

    let confirmedOrder = null;
    let alreadyConfirmed = false;

    await session.withTransaction(async () => {
      const order = await Order.findOne({ orderId }).session(session);

      if (!order) {
        const error = new Error('Order not found');
        error.statusCode = 404;
        throw error;
      }

      if (String(order.ownerId) !== String(req.owner._id)) {
        const error = new Error('You are not authorized to confirm this order');
        error.statusCode = 403;
        throw error;
      }

      if (
        order.paymentProvider !== 'DIRECT_UPI' ||
        order.paymentMethod !== 'DIRECT_UPI'
      ) {
        const error = new Error('This order does not use Direct UPI');
        error.statusCode = 400;
        throw error;
      }

      if (order.status === 'Rejected' || order.status === 'Completed') {
        const error = new Error(
          'Payment cannot be confirmed for this order status',
        );
        error.statusCode = 400;
        throw error;
      }

      if (order.ownerPaymentConfirmation?.status === 'CONFIRMED') {
        confirmedOrder = order;
        alreadyConfirmed = true;
        return;
      }

      const previousPaymentStatus = order.paymentStatus;
      const previousConfirmationStatus =
        order.ownerPaymentConfirmation?.status || 'PENDING';

      const confirmedAt = new Date();

      order.ownerPaymentConfirmation = {
        status: 'CONFIRMED',
        confirmedAt,
        reference: reference?.trim() || null,
      };

      order.paymentStatus = 'Paid';
      order.paidAt = confirmedAt;

      await order.save({ session });

      await recordPaymentAudit({
        order,
        actorType: 'OWNER',
        actorId: req.owner._id,
        action: 'PAYMENT_CONFIRMED',
        previousStatus: previousPaymentStatus,
        newStatus: order.paymentStatus,
        reason: 'Owner verified payment receipt in their bank/UPI app',
        reference: reference?.trim() || null,
        metadata: {
          previousConfirmationStatus,
          confirmationStatus: 'CONFIRMED',
          paymentProvider: order.paymentProvider,
          paymentMethod: order.paymentMethod,
        },
        session,
      });

      confirmedOrder = order;
    });

    if (alreadyConfirmed) {
      return res.status(200).json({
        message: 'Payment was already confirmed',
        order: confirmedOrder,
      });
    }

    return res.status(200).json({
      message: 'Direct UPI payment confirmed',
      order: confirmedOrder,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    console.error('Direct UPI confirmation error:', error);

    return res.status(500).json({
      message: 'Unable to confirm payment',
    });
  } finally {
    await session.endSession();
  }
}

async function updateOrderStatus(req, res) {
  let orderSavedInTransaction = false;

  try {
    const { orderId } = req.params;
    const { status, rejectionReason, rejectionDescription, paymentReceived } =
      req.body;

    const allowedStatuses = [
      'Pending',
      'Accepted',
      'Preparing',
      'Ready',
      'OutForDelivery',
      'Completed',
      'Rejected',
    ];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid order status',
      });
    }

    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({
        message: 'Order not found',
      });
    }

    // Ensure the authenticated owner owns this order.
    if (String(order.ownerId) !== String(req.owner._id)) {
      return res.status(403).json({
        message: 'You are not authorized to update this order',
      });
    }

    // Owners can only manage shop-side order statuses.
    const ownerAllowedStatuses = ['Accepted', 'Preparing', 'Ready', 'Rejected'];

    if (!ownerAllowedStatuses.includes(status)) {
      return res.status(403).json({
        message: 'This status must be updated through the delivery workflow',
      });
    }

    if (order.status === status) {
      return res.status(400).json({
        message: `Order is already ${status}`,
      });
    }

    // ==========================================
    // DELIVERY ASSIGNMENT VALIDATION
    // ==========================================

    if (status === 'OutForDelivery') {
      // Delivery must already have been assigned and accepted.
      if (order.deliveryAssignmentStatus !== 'ACCEPTED') {
        return res.status(400).json({
          message:
            'Delivery partner must accept the delivery assignment before the order can go OutForDelivery',
        });
      }

      if (!order.deliveryAssignmentType) {
        return res.status(400).json({
          message: 'Delivery assignment type is missing',
        });
      }

      if (!order.deliveryPersonId) {
        return res.status(400).json({
          message: 'Delivery person is missing',
        });
      }

      const selectedDeliveryPerson = await DeliveryPerson.findById(
        order.deliveryPersonId,
      );

      if (!selectedDeliveryPerson) {
        return res.status(400).json({
          message: 'Assigned delivery person was not found',
        });
      }

      if (!selectedDeliveryPerson.isActive) {
        return res.status(400).json({
          message: 'Assigned delivery person is inactive',
        });
      }

      // ==========================================
      // RMA DELIVERY PARTNER VALIDATION
      // ==========================================

      if (order.deliveryAssignmentType === 'RMA') {
        if (selectedDeliveryPerson.deliveryType !== 'RMA') {
          return res.status(400).json({
            message: 'Assigned delivery person is not an RMA delivery partner',
          });
        }

        if (selectedDeliveryPerson.applicationStatus !== 'APPROVED') {
          return res.status(400).json({
            message: 'Assigned RMA delivery partner is not approved',
          });
        }

        // After accepting the assignment, the DP should be BUSY.
        if (selectedDeliveryPerson.availabilityStatus !== 'BUSY') {
          return res.status(400).json({
            message:
              'Assigned RMA delivery partner is not currently handling this delivery',
          });
        }
      }

      // ==========================================
      // SHOP DELIVERY PARTNER VALIDATION
      // ==========================================

      if (order.deliveryAssignmentType === 'SHOP') {
        if (selectedDeliveryPerson.deliveryType !== 'SHOP') {
          return res.status(400).json({
            message: 'Assigned delivery person is not a shop delivery partner',
          });
        }

        if (String(selectedDeliveryPerson.ownerId) !== String(order.ownerId)) {
          return res.status(400).json({
            message: 'Assigned delivery person does not belong to this shop',
          });
        }
      }
    }

    // ==========================================
    // RECORD STATUS TIMESTAMP
    // ==========================================

    if (status === 'Accepted' && order.status !== 'Accepted') {
      order.acceptedAt = new Date();

      // ==========================================
      // START OWNER SETTLEMENT
      // ==========================================

      if (
        order.paymentMethod === 'ONLINE' &&
        order.paymentProvider !== 'DIRECT_UPI' &&
        order.paymentStatus === 'Paid' &&
        order.settlementStatus === 'NotRequired'
      ) {
        order.settlementStatus = 'Pending';
      }
    }

    if (status === 'Preparing' && order.status !== 'Preparing') {
      order.preparingAt = new Date();
    }

    if (status === 'Ready' && order.status !== 'Ready') {
      order.readyAt = new Date();
    }

    if (status === 'OutForDelivery' && order.status !== 'OutForDelivery') {
      order.outForDeliveryAt = new Date();

      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      order.deliveryOtp = otp;
      order.deliveryOtpGeneratedAt = new Date();
      order.otpVerified = false;
    }

    if (status === 'Completed' && order.status !== 'Completed') {
      order.completedAt = new Date();

      // ==========================================
      // COMPLETE ORDER FIRST
      // ==========================================

      order.status = 'Completed';

      await order.save();

      // ==========================================
      // REAL TESTBANK SETTLEMENT
      // ==========================================

      if (
        order.paymentMethod === 'ONLINE' &&
        order.paymentProvider !== 'DIRECT_UPI' &&
        order.paymentStatus === 'Paid' &&
        ['Pending', 'Processing', 'Failed'].includes(order.settlementStatus)
      ) {
        try {
          order.settlementStatus = 'Processing';

          await order.save();

          const settlementResult = await settleCompletedOrder(order.orderId);

          console.log('========== ORDER SETTLEMENT SUCCESS ==========');
          console.log({
            orderId: order.orderId,
            alreadySettled: settlementResult.alreadySettled,
            settlementStatus: settlementResult.order.settlementStatus,
            settledAt: settlementResult.order.settledAt,
          });
          console.log('===============================================');

          // Refresh the order after settlement.
          const settledOrder = await Order.findOne({
            orderId: order.orderId,
          });

          if (settledOrder) {
            order.settlementStatus = settledOrder.settlementStatus;
            order.settledAt = settledOrder.settledAt;
          }
        } catch (settlementError) {
          console.error(
            `Settlement failed for ${order.orderId}:`,
            settlementError,
          );

          order.settlementStatus = 'Failed';

          await order.save();

          return res.status(502).json({
            message:
              'Order was completed, but financial settlement could not be completed',
            error: settlementError.message,
            order,
          });
        }
      }
    }

    // ==========================================
    // REJECT ORDER + REFUND PAID ONLINE ORDER
    // ==========================================

    if (status === 'Rejected' && order.status !== 'Rejected') {
      if (!rejectionReason || !rejectionReason.trim()) {
        return res.status(400).json({
          message: 'Rejection reason is required',
        });
      }

      // Prevent rejection of an order that has already
      // moved beyond the Pending stage.
      if (order.status !== 'Pending') {
        return res.status(400).json({
          message: `Order cannot be rejected because it is already ${order.status}`,
        });
      }

      order.rejectedAt = new Date();

      order.rejectionReason = rejectionReason.trim();
      order.rejectionDescription = rejectionDescription?.trim() || null;

      // Track Direct UPI refunds for manual processing.
      const isDirectUpiOrder =
        order.paymentProvider === 'DIRECT_UPI' &&
        order.paymentMethod === 'DIRECT_UPI';

      if (isDirectUpiOrder) {
        const paymentAlreadyConfirmed =
          order.ownerPaymentConfirmation?.status === 'CONFIRMED' &&
          order.paymentStatus === 'Paid';

        if (!paymentAlreadyConfirmed && typeof paymentReceived !== 'boolean') {
          return res.status(409).json({
            code: 'DIRECT_UPI_PAYMENT_CHECK_REQUIRED',
            message:
              'Verify the customer payment in your bank/UPI app and select whether the money was received.',
          });
        }

        const session = await mongoose.startSession();

        try {
          await session.withTransaction(async () => {
            const transactionalOrder = await Order.findById(order._id).session(
              session,
            );

            if (!transactionalOrder) {
              const error = new Error('Order not found during rejection');
              error.statusCode = 404;
              throw error;
            }

            if (String(transactionalOrder.ownerId) !== String(req.owner._id)) {
              const error = new Error(
                'You are not authorized to reject this order',
              );
              error.statusCode = 403;
              throw error;
            }

            if (transactionalOrder.status !== 'Pending') {
              const error = new Error(
                `Order cannot be rejected because it is already ${transactionalOrder.status}`,
              );
              error.statusCode = 409;
              throw error;
            }

            const transactionPaymentConfirmed =
              transactionalOrder.ownerPaymentConfirmation?.status ===
                'CONFIRMED' && transactionalOrder.paymentStatus === 'Paid';

            if (!transactionPaymentConfirmed) {
              if (paymentReceived === true) {
                const confirmedAt = new Date();
                const previousPaymentStatus = transactionalOrder.paymentStatus;
                const previousConfirmationStatus =
                  transactionalOrder.ownerPaymentConfirmation?.status ||
                  'PENDING';

                transactionalOrder.ownerPaymentConfirmation = {
                  status: 'CONFIRMED',
                  confirmedAt,
                  reference:
                    transactionalOrder.ownerPaymentConfirmation?.reference ||
                    null,
                };

                transactionalOrder.paymentStatus = 'Paid';
                transactionalOrder.paidAt = confirmedAt;

                await transactionalOrder.save({ session });

                await recordPaymentAudit({
                  order: transactionalOrder,
                  actorType: 'OWNER',
                  actorId: req.owner._id,
                  action: 'PAYMENT_CONFIRMED',
                  previousStatus: previousPaymentStatus,
                  newStatus: 'Paid',
                  reason:
                    'Owner verified payment receipt while rejecting the order',
                  reference:
                    transactionalOrder.ownerPaymentConfirmation.reference,
                  metadata: {
                    previousConfirmationStatus,
                    confirmationStatus: 'CONFIRMED',
                    paymentProvider: transactionalOrder.paymentProvider,
                    paymentMethod: transactionalOrder.paymentMethod,
                  },
                  session,
                });
              } else {
                // Owner explicitly confirmed no payment was received.
                // Reject without creating a refund obligation.
                transactionalOrder.rejectedAt = new Date();
                transactionalOrder.rejectionReason = rejectionReason.trim();
                transactionalOrder.rejectionDescription =
                  rejectionDescription?.trim() || null;
                transactionalOrder.status = 'Rejected';

                await transactionalOrder.save({ session });

                Object.assign(order, transactionalOrder.toObject());
                orderSavedInTransaction = true;
                return;
              }
            }

            const refundAmount =
              Math.round(
                Number(
                  transactionalOrder.customerPayableAmount ||
                    transactionalOrder.totalPrice,
                ) * 100,
              ) / 100;

            await validateDirectUpiRefund(transactionalOrder, refundAmount, {
              session,
            });

            const existingRefund = await PaymentRefund.findOne({
              order: transactionalOrder._id,
              activeRefund: true,
            }).session(session);

            if (existingRefund) {
              const error = new Error(
                'An active refund request already exists for this order',
              );
              error.statusCode = 409;
              throw error;
            }

            const previousRefundStatus =
              transactionalOrder.refundStatus || 'NotRequired';

            const [refund] = await PaymentRefund.create(
              [
                {
                  order: transactionalOrder._id,
                  orderId: transactionalOrder.orderId,
                  requestedByType: 'OWNER',
                  requestedById: req.owner._id,
                  amount: refundAmount,
                  reason: rejectionReason.trim(),
                  status: 'REQUESTED',
                  activeRefund: true,
                },
              ],
              { session },
            );

            transactionalOrder.rejectedAt = new Date();
            transactionalOrder.rejectionReason = rejectionReason.trim();
            transactionalOrder.rejectionDescription =
              rejectionDescription?.trim() || null;

            transactionalOrder.refundStatus = 'Pending';
            transactionalOrder.refundAmount = refundAmount;
            transactionalOrder.refundType = 'FULL';
            transactionalOrder.refundReason = rejectionReason.trim();
            transactionalOrder.refundInitiatedAt = new Date();
            transactionalOrder.settlementStatus = 'NotRequired';
            transactionalOrder.status = 'Rejected';

            await recordPaymentAudit({
              order: transactionalOrder,
              actorType: 'OWNER',
              actorId: req.owner._id,
              action: 'PAYMENT_NOT_RECEIVED_CONFIRMED',
              previousStatus: transactionalOrder.paymentStatus,
              newStatus: transactionalOrder.paymentStatus,
              reason: 'Owner verified that payment was not received',
              metadata: {
                paymentProvider: transactionalOrder.paymentProvider,
                paymentMethod: transactionalOrder.paymentMethod,
                rejectionReason: rejectionReason.trim(),
              },
              session,
            });

            await transactionalOrder.save({ session });

            await recordPaymentAudit({
              order: transactionalOrder,
              actorType: 'OWNER',
              actorId: req.owner._id,
              action: 'REFUND_REQUESTED',
              previousStatus: previousRefundStatus,
              newStatus: 'Pending',
              reason: rejectionReason.trim(),
              metadata: {
                refundId: String(refund._id),
                amount: refundAmount,
                method: 'DIRECT_UPI_MANUAL',
              },
              session,
            });

            Object.assign(order, transactionalOrder.toObject());
            orderSavedInTransaction = true;
          });
        } catch (refundError) {
          if (refundError.statusCode) {
            return res.status(refundError.statusCode).json({
              message: refundError.message,
            });
          }

          if (
            refundError.message === 'Only paid orders can be refunded' ||
            refundError.message ===
              'Direct UPI payment has not been confirmed' ||
            refundError.message === 'This is not a Direct UPI order' ||
            refundError.message === 'Refund amount must be greater than zero' ||
            refundError.message === 'Invalid original payment amount' ||
            refundError.message.startsWith(
              'Refund exceeds the remaining refundable amount',
            ) ||
            refundError.message.startsWith('Order cannot be rejected')
          ) {
            return res.status(400).json({
              message: refundError.message,
            });
          }

          throw refundError;
        } finally {
          await session.endSession();
        }
      }

      // ==========================================
      // ONLINE PAYMENT REFUND
      // ==========================================

      if (
        order.paymentMethod === 'ONLINE' &&
        order.paymentProvider !== 'DIRECT_UPI' &&
        order.paymentStatus === 'Paid'
      ) {
        try {
          // Mark refund as processing before calling PayU.
          order.refundStatus = 'Processing';
          order.refundAmount = Number(
            (order.customerPayableAmount || order.totalPrice).toFixed(2),
          );

          order.refundType = 'FULL';
          order.refundReason = rejectionReason.trim();

          order.refundInitiatedAt = new Date();

          await order.save();

          // Initiate FULL customer refund through PayU.
          const refundResult = await initiatePayURefund(
            order,
            order.customerPayableAmount || order.totalPrice,
          );

          // Store PayU refund information.
          order.refundStatus = 'Processing';
          order.refundAmount = refundResult.refundAmount;
          order.refundId = refundResult.requestId || refundResult.refundToken;

          // No settlement should happen because
          // the order was rejected.
          order.settlementStatus = 'NotRequired';

          order.status = 'Rejected';

          await order.save();

          await order.populate('ownerId', 'ownerName shopName phone');

          return res.status(200).json({
            message: 'Order rejected and full refund initiated successfully',
            order,
          });
        } catch (refundError) {
          console.error('PayU refund failed:', refundError.message);

          // Refund did not get initiated successfully.
          // Keep payment as Paid because the customer
          // has NOT been confirmed as refunded.
          order.refundStatus = 'Failed';
          order.refundAmount = Number(
            (order.customerPayableAmount || order.totalPrice).toFixed(2),
          );

          // Do not mark the payment as Refunded here.
          order.paymentStatus = 'Paid';

          // The order can still be rejected, but the
          // unpaid refund must be visible for retry/admin action.
          order.status = 'Rejected';

          await order.save();

          return res.status(502).json({
            message:
              'Order was rejected, but the customer refund could not be initiated',
            error: refundError.message,
            order,
          });
        }
      }
    }

    if (!orderSavedInTransaction) {
      order.status = status;
      await order.save();
    }

    // ==========================================
    // CUSTOMER ORDER STATUS NOTIFICATION
    // ==========================================

    if (order.customerId) {
      try {
        const statusNotifications = {
          Accepted: {
            type: 'ORDER_ACCEPTED',
            title: 'Order Accepted',
            message: `Your order ${order.orderId} has been accepted by the shop.`,
            data: {
              screen: 'order-status',
            },
          },

          OutForDelivery: {
            type: 'ORDER_OUT_FOR_DELIVERY',
            title: 'Order On The Way',
            message: `Your order ${order.orderId} is out for delivery.`,
            data: {
              screen: 'order-status',
            },
          },

          Completed: {
            type: 'ORDER_COMPLETED',
            title: 'Order Delivered',
            message: `Your order ${order.orderId} has been delivered. Thank you for ordering with RMA!`,
            data: {
              screen: 'order-status',
            },
          },

          Rejected: {
            type: 'ORDER_REJECTED',
            title: 'Order Rejected',
            message:
              `Your order ${order.orderId} has been rejected by the shop. ` +
              `Reason: ${order.rejectionReason}.`,
            data: {
              screen: 'order-status',
            },
          },
        };

        const notification = statusNotifications[status];

        if (notification) {
          await createAndSendNotification({
            recipientType: 'customer',
            recipientId: order.customerId,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            orderId: order.orderId,
            data: {
              ...notification.data,
              orderId: order.orderId,
            },
          });
        }
      } catch (notificationError) {
        console.error(
          'Customer order status notification failed:',
          notificationError,
        );
      }
    }

    await order.populate('ownerId', 'ownerName shopName phone');

    return res.status(200).json({
      message: 'Order status updated successfully',
      order,
    });
  } catch (error) {
    console.error('Update order status failed:', error.message);

    return res.status(500).json({
      message: 'Server error',
    });
  }
}

async function createDeliveryAssignment(req, res) {
  try {
    const { orderId } = req.params;
    const { deliveryAssignmentType, deliveryPersonId } = req.body;

    if (!['SHOP', 'RMA'].includes(deliveryAssignmentType)) {
      return res.status(400).json({
        message: 'Delivery assignment type is required',
      });
    }

    if (!deliveryPersonId) {
      return res.status(400).json({
        message: 'Delivery person is required',
      });
    }

    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({
        message: 'Order not found',
      });
    }

    // Assignment is only allowed when the order is ready.
    if (order.status !== 'Ready') {
      return res.status(400).json({
        message: `Delivery can only be assigned when order is Ready. Current status: ${order.status}`,
      });
    }

    // Only delivery orders can have a delivery partner.
    if (order.orderType !== 'delivery') {
      return res.status(400).json({
        message: 'Delivery partner cannot be assigned to a pickup order',
      });
    }

    // Prevent assigning another partner while an assignment
    // is already waiting for a response.
    if (order.deliveryAssignmentStatus === 'PENDING') {
      return res.status(400).json({
        message: 'This order already has a pending delivery assignment',
      });
    }

    const selectedDeliveryPerson = await DeliveryPerson.findOne({
      _id: deliveryPersonId,
      deliveryType: deliveryAssignmentType,
      isActive: true,
    });

    if (!selectedDeliveryPerson) {
      return res.status(400).json({
        message: 'Selected delivery person is not available',
      });
    }

    console.log('[OWNER ASSIGNMENT DEBUG]', {
      orderId: order.orderId,
      selectedDeliveryPersonId: String(selectedDeliveryPerson._id),
      deliveryType: selectedDeliveryPerson.deliveryType,
      availabilityStatus: selectedDeliveryPerson.availabilityStatus,
      applicationStatus: selectedDeliveryPerson.applicationStatus,
      isActive: selectedDeliveryPerson.isActive,
      locationUpdatedAt: selectedDeliveryPerson.currentLocation?.updatedAt,
      activeOrders: await Order.countDocuments({
        deliveryPersonId: selectedDeliveryPerson._id,
        orderType: 'delivery',
        deliveryAssignmentStatus: 'ACCEPTED',
        status: { $in: ['Ready', 'OutForDelivery'] },
      }),
    });

    // ==========================================
    // RMA DELIVERY PARTNER VALIDATION
    // ==========================================

    if (deliveryAssignmentType === 'RMA') {
      if (selectedDeliveryPerson.applicationStatus !== 'APPROVED') {
        return res.status(400).json({
          message: 'Selected RMA delivery partner is not approved',
        });
      }

      const MAX_ACTIVE_ORDERS_PER_TRIP = 6;

      const activeOrderCount = await Order.countDocuments({
        deliveryPersonId: selectedDeliveryPerson._id,
        orderType: 'delivery',
        deliveryAssignmentStatus: 'ACCEPTED',
        status: { $in: ['Ready', 'OutForDelivery'] },
      });

      if (activeOrderCount >= MAX_ACTIVE_ORDERS_PER_TRIP) {
        return res.status(409).json({
          message:
            'Selected RMA delivery partner has reached the maximum active-order capacity',
          activeOrderCount,
          maxActiveOrders: MAX_ACTIVE_ORDERS_PER_TRIP,
        });
      }

      if (
        !['AVAILABLE', 'BUSY'].includes(
          selectedDeliveryPerson.availabilityStatus,
        )
      ) {
        return res.status(400).json({
          message: 'Selected RMA delivery partner is no longer available',
        });
      }

      const latitude = selectedDeliveryPerson.currentLocation?.latitude;
      const longitude = selectedDeliveryPerson.currentLocation?.longitude;
      const locationUpdatedAt =
        selectedDeliveryPerson.currentLocation?.updatedAt;

      if (typeof latitude !== 'number' || typeof longitude !== 'number') {
        return res.status(400).json({
          message: 'Selected RMA delivery partner location is unavailable',
        });
      }

      if (
        !locationUpdatedAt ||
        Date.now() - new Date(locationUpdatedAt).getTime() > 10 * 60 * 1000
      ) {
        return res.status(400).json({
          message: 'Selected RMA delivery partner location is outdated',
        });
      }
    }

    // ==========================================
    // SHOP DELIVERY PARTNER VALIDATION
    // ==========================================

    if (
      deliveryAssignmentType === 'SHOP' &&
      String(selectedDeliveryPerson.ownerId) !== String(order.ownerId)
    ) {
      return res.status(400).json({
        message: 'Selected delivery person does not belong to this shop',
      });
    }

    // ==========================================
    // SAVE PENDING ASSIGNMENT
    // ==========================================

    order.deliveryAssignmentType = deliveryAssignmentType;
    order.deliveryPersonId = selectedDeliveryPerson._id;
    order.deliveryAssignmentStatus = 'PENDING';

    await order.save();

    // ==========================================
    // NOTIFY DELIVERY PARTNER
    // ==========================================

    try {
      await createAndSendNotification({
        recipientType: 'delivery',
        recipientId: selectedDeliveryPerson._id,
        type: 'DELIVERY_ASSIGNMENT_REQUEST',
        title: 'New Delivery Request',
        message: `Order ${order.orderId} is waiting for your response.`,
        orderId: order.orderId,
        data: {
          screen: 'delivery-orders',
          orderId: order.orderId,
          assignmentStatus: 'PENDING',
        },
      });
    } catch (notificationError) {
      console.error(
        'Delivery assignment request notification failed:',
        notificationError,
      );
    }

    await order.populate('ownerId', 'ownerName shopName phone');

    return res.status(200).json({
      success: true,
      message: 'Delivery assignment request sent successfully',
      order,
    });
  } catch (error) {
    console.error('Create delivery assignment failed:', error.message);

    return res.status(500).json({
      message: 'Server error',
    });
  }
}

// ==========================================
// START RMA AUTOMATIC DISPATCH
// ==========================================

async function startRmaDispatch(req, res) {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({
        message: 'Order not found',
      });
    }

    // ==========================================
    // ORDER VALIDATION
    // ==========================================

    if (order.status !== 'Ready') {
      return res.status(400).json({
        message: `RMA delivery can only be started when order is Ready. Current status: ${order.status}`,
      });
    }

    if (order.orderType !== 'delivery') {
      return res.status(400).json({
        message: 'RMA delivery is only available for delivery orders',
      });
    }

    if (!order.pickupLocation?.latitude || !order.pickupLocation?.longitude) {
      return res.status(400).json({
        message: 'Shop pickup location is unavailable',
      });
    }

    if (
      !order.deliveryLocation?.latitude ||
      !order.deliveryLocation?.longitude
    ) {
      return res.status(400).json({
        message: 'Customer delivery location is unavailable',
      });
    }

    // ==========================================
    // EXISTING ASSIGNMENT VALIDATION
    // ==========================================

    if (order.deliveryAssignmentStatus === 'ACCEPTED') {
      return res.status(400).json({
        message: 'A delivery partner has already accepted this order',
      });
    }

    if (order.deliveryAssignmentStatus === 'PENDING') {
      return res.status(400).json({
        message: 'RMA delivery dispatch is already in progress',
      });
    }

    // ==========================================
    // FIND ELIGIBLE RMA DELIVERY PARTNERS
    // ==========================================

    const locationCutoff = new Date(Date.now() - 10 * 60 * 1000);
    const MAX_ACTIVE_ORDERS_PER_TRIP = 6;

    const rmaPartners = await DeliveryPerson.find({
      deliveryType: 'RMA',
      applicationStatus: 'APPROVED',
      isActive: true,
      availabilityStatus: { $in: ['AVAILABLE', 'BUSY'] },

      'currentLocation.latitude': { $ne: null },
      'currentLocation.longitude': { $ne: null },
      'currentLocation.updatedAt': { $gte: locationCutoff },
    })
      .select(
        'name phone deliveryType applicationStatus isActive availabilityStatus currentLocation',
      )
      .lean();

    // Count all accepted active delivery orders, including
    // orders waiting for pickup and orders already in transit.
    const activeOrders = await Order.aggregate([
      {
        $match: {
          deliveryPersonId: {
            $in: rmaPartners.map((partner) => partner._id),
          },
          orderType: 'delivery',
          deliveryAssignmentStatus: 'ACCEPTED',
          status: { $in: ['Ready', 'OutForDelivery'] },
        },
      },
      {
        $group: {
          _id: '$deliveryPersonId',
          count: { $sum: 1 },
        },
      },
    ]);

    const activeOrderCounts = new Map(
      activeOrders.map((item) => [String(item._id), item.count]),
    );

    // Keep partners who have room for another order.
    const eligiblePartners = rmaPartners
      .filter((partner) => {
        const activeCount = activeOrderCounts.get(String(partner._id)) || 0;

        return activeCount < MAX_ACTIVE_ORDERS_PER_TRIP;
      })
      .map((partner) => {
        const distance = calculateDistanceKm(
          Number(partner.currentLocation.latitude),
          Number(partner.currentLocation.longitude),
          Number(order.pickupLocation.latitude),
          Number(order.pickupLocation.longitude),
        );

        return { partner, distance };
      })
      .filter(
        (candidate) =>
          Number.isFinite(candidate.distance) && candidate.distance <= 5,
      )
      .sort((a, b) => a.distance - b.distance);

    // ==========================================
    // NO PARTNER AVAILABLE
    // ==========================================

    if (eligiblePartners.length === 0) {
      return res.status(409).json({
        success: false,
        code: 'NO_RMA_DELIVERY_PARTNER',
        message:
          'No eligible RMA delivery partner with available capacity was found nearby.',
      });
    }

    // ==========================================
    // SELECT NEAREST ELIGIBLE PARTNER
    //
    // This is intentionally simple for V1.
    //
    // Later this selection will consider:
    // - workload
    // - route compatibility
    // - existing batches
    // - delivery area
    // - estimated detour
    // - recent assignment frequency
    // - capacity
    // ==========================================

    const selectedCandidate = eligiblePartners[0];

    const selectedDeliveryPerson = await DeliveryPerson.findById(
      selectedCandidate.partner._id,
    );

    if (!selectedDeliveryPerson) {
      return res.status(409).json({
        message: 'Selected delivery partner is no longer available',
      });
    }

    // Re-check availability immediately before assignment.
    if (
      selectedDeliveryPerson.applicationStatus !== 'APPROVED' ||
      !selectedDeliveryPerson.isActive ||
      !['AVAILABLE', 'BUSY'].includes(selectedDeliveryPerson.availabilityStatus)
    ) {
      return res.status(409).json({
        message: 'Selected delivery partner is no longer available',
      });
    }

    // ==========================================
    // SAVE RMA ASSIGNMENT
    // ==========================================

    order.deliveryAssignmentType = 'RMA';

    order.deliveryPersonId = selectedDeliveryPerson._id;

    order.deliveryAssignmentStatus = 'PENDING';

    order.deliveryPickupStatus = 'PENDING';

    order.deliveryOtp = null;

    order.deliveryOtpGeneratedAt = null;

    order.otpVerified = false;

    await order.save();

    // ==========================================
    // NOTIFY DELIVERY PARTNER
    // ==========================================

    try {
      await createAndSendNotification({
        recipientType: 'delivery',
        recipientId: selectedDeliveryPerson._id,
        type: 'DELIVERY_ASSIGNMENT_REQUEST',
        title: 'New Delivery Request',
        message: `Order ${order.orderId} is waiting for your response.`,
        orderId: order.orderId,
        data: {
          screen: 'delivery-orders',
          orderId: order.orderId,
          assignmentStatus: 'PENDING',
          deliveryAssignmentType: 'RMA',
        },
      });
    } catch (notificationError) {
      console.error(
        'RMA delivery assignment notification failed:',
        notificationError,
      );
    }

    await order.populate('ownerId', 'ownerName shopName phone');

    return res.status(200).json({
      success: true,
      message: 'RMA delivery partner search started',
      dispatchStatus: 'WAITING_FOR_ACCEPTANCE',
      order,
    });
  } catch (error) {
    console.error('Start RMA dispatch failed:', error);

    return res.status(500).json({
      message: 'Failed to start RMA delivery dispatch',
    });
  }
}

// ==========================================
// PREVIEW DELIVERY CHARGE
// ==========================================

async function previewDeliveryCharge(req, res) {
  try {
    const { ownerId, deliveryLocation } = req.body;

    if (!ownerId) {
      return res.status(400).json({
        message: 'Owner ID is required',
      });
    }

    if (
      !deliveryLocation ||
      deliveryLocation.latitude === undefined ||
      deliveryLocation.longitude === undefined
    ) {
      return res.status(400).json({
        message: 'Valid delivery location is required',
      });
    }

    const owner = await Owner.findById(ownerId);

    if (!owner) {
      return res.status(404).json({
        message: 'Shop owner not found',
      });
    }

    const shopLatitude = owner.location?.latitude;
    const shopLongitude = owner.location?.longitude;

    const customerLatitude = Number(deliveryLocation.latitude);
    const customerLongitude = Number(deliveryLocation.longitude);

    if (
      shopLatitude === undefined ||
      shopLongitude === undefined ||
      !Number.isFinite(customerLatitude) ||
      !Number.isFinite(customerLongitude)
    ) {
      return res.status(400).json({
        message: 'Valid shop and delivery locations are required',
      });
    }

    const deliveryDistance = calculateDistanceKm(
      Number(shopLatitude),
      Number(shopLongitude),
      customerLatitude,
      customerLongitude,
    );

    // RMA delivery pricing:
    // ₹18 base + ₹8 per kilometre
    const deliveryCharge = Number((2 + 0 * deliveryDistance).toFixed(2));
    // const deliveryCharge = 0;

    return res.status(200).json({
      deliveryDistance: Number(deliveryDistance.toFixed(2)),
      deliveryCharge,
    });
  } catch (error) {
    console.error('Delivery preview failed:', error);

    return res.status(500).json({
      message: 'Failed to calculate delivery charge',
    });
  }
}

// ==========================================
// GET ALL ORDERS
// ==========================================

async function getAllOrders(req, res) {
  try {
    const orders = await Order.find()
      .populate('ownerId', 'ownerName shopName phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      orders,
    });
  } catch (error) {
    console.error('Get orders failed:', error.message);

    res.status(500).json({
      message: 'Server error',
    });
  }
}

// ==========================================
// GET ONE ORDER BY ORDER ID
// ==========================================

async function getOrderById(req, res) {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({ orderId }).populate(
      'ownerId',
      'ownerName shopName phone',
    );

    if (!order) {
      return res.status(404).json({
        message: 'Order not found',
      });
    }

    res.status(200).json({
      order,
    });
  } catch (error) {
    console.error('Get order failed:', error.message);

    res.status(500).json({
      message: 'Server error',
    });
  }
}

async function markOwnerRefundSent(req, res) {
  try {
    const { orderId, refundId } = req.params;
    const { reference, evidenceUrl, refundSentAt, reason } = req.body;

    if (
      typeof reference !== 'string' ||
      !reference.trim() ||
      reference.trim().length > 200
    ) {
      return res.status(400).json({
        message: 'A valid refund transaction reference is required.',
      });
    }

    if (
      typeof evidenceUrl !== 'string' ||
      !evidenceUrl.trim() ||
      evidenceUrl.trim().length > 2000
    ) {
      return res.status(400).json({
        message: 'Refund transfer evidence URL is required.',
      });
    }

    let parsedEvidenceUrl;

    try {
      parsedEvidenceUrl = new URL(evidenceUrl.trim());
    } catch {
      return res.status(400).json({
        message: 'Refund evidence URL is invalid.',
      });
    }

    if (parsedEvidenceUrl.protocol !== 'https:') {
      return res.status(400).json({
        message: 'Refund evidence URL must use HTTPS.',
      });
    }

    if (!refundSentAt) {
      return res.status(400).json({
        message: 'The actual refund transfer date and time are required.',
      });
    }

    const sentAt = new Date(refundSentAt);

    if (Number.isNaN(sentAt.getTime())) {
      return res.status(400).json({
        message: 'Refund transfer date and time are invalid.',
      });
    }

    if (sentAt.getTime() > Date.now() + 5 * 60 * 1000) {
      return res.status(400).json({
        message: 'Refund transfer date and time cannot be in the future.',
      });
    }

    const order = await Order.findOne({ orderId }).select(
      '_id orderId ownerId',
    );

    if (!order) {
      return res.status(404).json({
        message: 'Order not found.',
      });
    }

    if (String(order.ownerId) !== String(req.owner._id)) {
      return res.status(403).json({
        message:
          'You are not authorized to submit refund details for this order.',
      });
    }

    const refund = await PaymentRefund.findOne({
      _id: refundId,
      order: order._id,
      orderId: order.orderId,
    }).select('_id status activeRefund');

    if (!refund) {
      return res.status(404).json({
        message: 'Refund request not found for this order.',
      });
    }

    if (refund.status !== 'APPROVED' || !refund.activeRefund) {
      return res.status(409).json({
        message: 'Only an active, approved refund can be marked as sent.',
      });
    }

    const updatedRefund = await transitionRefund({
      refundId: refund._id,
      nextStatus: 'MARKED_SENT',
      actorType: 'OWNER',
      actorId: req.owner._id,
      reference: reference.trim(),
      evidenceUrl: evidenceUrl.trim(),
      refundSentAt: sentAt,
      reason:
        typeof reason === 'string' && reason.trim() ? reason.trim() : null,
    });

    return res.status(200).json({
      message:
        'Refund transfer details submitted. The refund is awaiting admin verification.',
      refund: updatedRefund,
    });
  } catch (error) {
    console.error('Mark owner refund as sent error:', error);

    if (
      /cannot move|not found|reference is required|evidence URL is required|date and time|future/i.test(
        error.message || '',
      )
    ) {
      return res.status(409).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: 'Unable to submit refund transfer details.',
    });
  }
}

async function getOwnerRefundRequests(req, res) {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({ orderId }).select(
      '_id orderId ownerId',
    );

    if (!order) {
      return res.status(404).json({
        message: 'Order not found.',
      });
    }

    if (String(order.ownerId) !== String(req.owner._id)) {
      return res.status(403).json({
        message: 'You are not authorized to view refunds for this order.',
      });
    }

    const refunds = await PaymentRefund.find({
      order: order._id,
      orderId: order.orderId,
    })
      .select(
        '_id orderId amount reason status activeRefund shopResponse refundReference refundEvidenceUrl refundSentAt verifiedAt adminNotes createdAt updatedAt',
      )
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      refunds,
    });
  } catch (error) {
    console.error('Get owner refund requests failed:', error);

    return res.status(500).json({
      message: 'Unable to load refund requests.',
    });
  }
}

module.exports = {
  initiatePayURefund,
  calculateDistanceKm,
  previewDeliveryCharge,
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  createDeliveryAssignment,
  startRmaDispatch,
  confirmDirectUpiPayment,
  markOwnerRefundSent,
  getOwnerRefundRequests,
};
