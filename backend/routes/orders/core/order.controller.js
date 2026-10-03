const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const Order = require('../../../models/Order');
const Owner = require('../../../models/Owner');
const Customer = require('../../../models/Customer');
const DeliveryPerson = require('../../../models/DeliveryPerson');

const {
  createAndSendNotification,
} = require('../../../services/notificationService');

const {
  offerRmaOrderToNextPartner,
} = require('../../../services/rmaDispatchService');

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
      paymentMethod !== 'ONLINE'
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

      deliveryCharge = Number((18 + 8 * deliveryDistance).toFixed(2));
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

      paymentMethod,
    });

    const order = await Order.create({
      orderId: `RMA${Date.now()}`,

      customerId,
      guestId: storedGuestId,

      ownerId,
      customer,
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

      paymentMethod,
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

async function updateOrderStatus(req, res) {
  try {
    const { orderId } = req.params;
    const { status, rejectionReason, rejectionDescription } = req.body;

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
      // OWNER SETTLEMENT
      // ==========================================

      if (
        order.paymentStatus === 'Paid' &&
        order.settlementStatus === 'Pending'
      ) {
        order.settlementStatus = 'Processing';

        await order.save();

        order.settlementStatus = 'Settled';
        order.settledAt = new Date();
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

      // ==========================================
      // ONLINE PAYMENT REFUND
      // ==========================================

      if (order.paymentMethod === 'ONLINE' && order.paymentStatus === 'Paid') {
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

          // ==========================================
          // CUSTOMER REJECTION NOTIFICATION
          // ==========================================

          // if (order.customerId) {
          //   try {
          //     await createAndSendNotification({
          //       recipientType: 'customer',
          //       recipientId: order.customerId,
          //       type: 'ORDER_REJECTED',
          //       title: 'Order Rejected',
          //       message: `Your order ${order.orderId} has been rejected by the shop.`,
          //       orderId: order.orderId,
          //       data: {
          //         screen: 'orders',
          //       },
          //     });
          //   } catch (notificationError) {
          //     console.error(
          //       'Customer rejection notification failed:',
          //       notificationError,
          //     );
          //   }
          // }

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

    order.status = status;

    await order.save();

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

    // ==========================================
    // RMA DELIVERY PARTNER VALIDATION
    // ==========================================

    if (deliveryAssignmentType === 'RMA') {
      if (selectedDeliveryPerson.applicationStatus !== 'APPROVED') {
        return res.status(400).json({
          message: 'Selected RMA delivery partner is not approved',
        });
      }

      if (selectedDeliveryPerson.availabilityStatus !== 'AVAILABLE') {
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

    const rmaPartners = await DeliveryPerson.find({
      deliveryType: 'RMA',
      applicationStatus: 'APPROVED',
      isActive: true,
      availabilityStatus: 'AVAILABLE',

      'currentLocation.latitude': {
        $ne: null,
      },

      'currentLocation.longitude': {
        $ne: null,
      },

      'currentLocation.updatedAt': {
        $gte: locationCutoff,
      },
    })
      .select(
        'name phone deliveryType applicationStatus isActive availabilityStatus currentLocation',
      )
      .lean();

    // ==========================================
    // REMOVE PARTNERS ALREADY HANDLING ORDERS
    //
    // V1:
    // One active delivery order per DP.
    //
    // IMPORTANT:
    // This is only a V1 dispatch restriction.
    // The architecture will later support multiple
    // compatible orders in one delivery trip.
    // ==========================================

    const activeOrders = await Order.find({
      deliveryPersonId: {
        $in: rmaPartners.map((partner) => partner._id),
      },

      deliveryAssignmentType: 'RMA',

      deliveryAssignmentStatus: 'ACCEPTED',

      status: 'OutForDelivery',
    })
      .select('deliveryPersonId')
      .lean();

    const busyPartnerIds = new Set(
      activeOrders.map((activeOrder) => String(activeOrder.deliveryPersonId)),
    );

    // ==========================================
    // CALCULATE DP → SHOP DISTANCE
    // ==========================================

    const eligiblePartners = rmaPartners
      .filter((partner) => !busyPartnerIds.has(String(partner._id)))
      .map((partner) => {
        const distance = calculateDistanceKm(
          Number(partner.currentLocation.latitude),
          Number(partner.currentLocation.longitude),
          Number(order.pickupLocation.latitude),
          Number(order.pickupLocation.longitude),
        );

        return {
          partner,
          distance,
        };
      })
      .filter((candidate) => candidate.distance <= 5)
      .sort((a, b) => a.distance - b.distance);

    // ==========================================
    // NO PARTNER AVAILABLE
    // ==========================================

    if (eligiblePartners.length === 0) {
      return res.status(409).json({
        success: false,
        code: 'NO_RMA_DELIVERY_PARTNER',
        message: 'No RMA delivery partner is currently available nearby',
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
      selectedDeliveryPerson.availabilityStatus !== 'AVAILABLE'
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
    const deliveryCharge = Number((18 + 8 * deliveryDistance).toFixed(2));

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
};
