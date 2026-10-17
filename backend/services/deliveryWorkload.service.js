const mongoose = require('mongoose');

const Order = require('../models/Order');
const DeliveryPerson = require('../models/DeliveryPerson');

const MAX_ACTIVE_ORDERS_PER_TRIP = 6;

const ACTIVE_ORDER_STATUSES = ['Ready', 'OutForDelivery'];

// Accepted orders awaiting pickup or already in transit.
async function getActiveDeliveryOrderCount(deliveryPersonId, session = null) {
  const query = Order.countDocuments({
    deliveryPersonId,
    orderType: 'delivery',
    deliveryAssignmentStatus: 'ACCEPTED',
    status: { $in: ACTIVE_ORDER_STATUSES },
  });

  if (session) {
    query.session(session);
  }

  return query;
}

async function getActiveDeliveryOrders(deliveryPersonId) {
  return Order.find({
    deliveryPersonId,
    orderType: 'delivery',
    deliveryAssignmentStatus: 'ACCEPTED',
    status: { $in: ACTIVE_ORDER_STATUSES },
  })
    .select('orderId status ownerId deliveryAssignmentType')
    .sort({ createdAt: 1 });
}

// Recalculate availability based on the maximum active order limit.
// Never change a manually OFFLINE delivery partner to an online status.
async function refreshDeliveryAvailability(deliveryPersonId) {
  const activeCount = await getActiveDeliveryOrderCount(deliveryPersonId);

  const deliveryPerson = await DeliveryPerson.findById(deliveryPersonId);

  if (!deliveryPerson) {
    return {
      activeCount,
      availabilityStatus: null,
    };
  }

  let nextStatus = deliveryPerson.availabilityStatus;

  if (nextStatus !== 'OFFLINE') {
    nextStatus =
      activeCount >= MAX_ACTIVE_ORDERS_PER_TRIP ? 'BUSY' : 'AVAILABLE';
  }

  if (nextStatus !== deliveryPerson.availabilityStatus) {
    deliveryPerson.availabilityStatus = nextStatus;
    deliveryPerson.lastAvailabilityChangedAt = new Date();

    await deliveryPerson.save();
  }

  return {
    activeCount,
    availabilityStatus: deliveryPerson.availabilityStatus,
  };
}

async function withDeliveryAssignmentLock(deliveryPersonId, callback) {
  const session = await mongoose.startSession();

  try {
    let result;

    await session.withTransaction(async () => {
      // Every acceptance for this DP writes the same document.
      // Concurrent transactions therefore conflict and retry instead of
      // independently accepting orders based on the same stale count.
      const deliveryPerson = await DeliveryPerson.findOneAndUpdate(
        {
          _id: deliveryPersonId,
          isActive: true,
          applicationStatus: 'APPROVED',
          availabilityStatus: { $in: ['AVAILABLE', 'BUSY'] },
        },
        {
          $inc: { assignmentLockVersion: 1 },
        },
        {
          new: true,
          session,
        },
      );

      if (!deliveryPerson) {
        const error = new Error(
          'Your account is not eligible to accept delivery assignments.',
        );
        error.statusCode = 409;
        throw error;
      }

      const activeCount = await getActiveDeliveryOrderCount(
        deliveryPersonId,
        session,
      );

      if (activeCount >= MAX_ACTIVE_ORDERS_PER_TRIP) {
        const error = new Error(
          `You already have ${activeCount} active orders. Complete a delivery before accepting another.`,
        );
        error.statusCode = 409;
        throw error;
      }

      result = await callback({
        session,
        deliveryPerson,
        activeCount,
      });
    });

    return result;
  } finally {
    await session.endSession();
  }
}

module.exports = {
  MAX_ACTIVE_ORDERS_PER_TRIP,
  ACTIVE_ORDER_STATUSES,
  getActiveDeliveryOrderCount,
  getActiveDeliveryOrders,
  refreshDeliveryAvailability,
  withDeliveryAssignmentLock,
};
