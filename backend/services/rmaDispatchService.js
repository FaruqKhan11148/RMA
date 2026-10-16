const Order = require('../models/Order');
const DeliveryPerson = require('../models/DeliveryPerson');

const { createAndSendNotification } = require('./notificationService');

const DISPATCH_LOCATION_MAX_AGE_MS = 10 * 60 * 1000;
const DP_TO_SHOP_MAX_DISTANCE_KM = 5;
const MAX_ACTIVE_ORDERS_PER_TRIP = 6;

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

  const clampedA = Math.min(1, Math.max(0, a));
  const c = 2 * Math.atan2(Math.sqrt(clampedA), Math.sqrt(1 - clampedA));

  return earthRadiusKm * c;
}

// ==========================================
// COUNT ACTIVE ACCEPTED ORDERS
// ==========================================

async function getActiveOrderCounts(deliveryPersonIds) {
  if (!deliveryPersonIds.length) {
    return new Map();
  }

  const activeOrders = await Order.aggregate([
    {
      $match: {
        deliveryPersonId: { $in: deliveryPersonIds },
        deliveryAssignmentStatus: 'ACCEPTED',
        status: { $in: ['Ready', 'OutForDelivery'] },
        orderType: 'delivery',
      },
    },
    {
      $group: {
        _id: '$deliveryPersonId',
        count: { $sum: 1 },
      },
    },
  ]);

  return new Map(activeOrders.map((entry) => [String(entry._id), entry.count]));
}

// ==========================================
// FIND ELIGIBLE RMA DELIVERY PARTNERS
// ==========================================

async function findEligibleRmaDeliveryPartners(
  order,
  excludedDeliveryPersonIds = [],
) {
  const locationCutoff = new Date(Date.now() - DISPATCH_LOCATION_MAX_AGE_MS);

  const excludedIds = new Set(excludedDeliveryPersonIds.map(String));

  const shopLatitude = Number(order.pickupLocation?.latitude);
  const shopLongitude = Number(order.pickupLocation?.longitude);

  if (!Number.isFinite(shopLatitude) || !Number.isFinite(shopLongitude)) {
    return [];
  }

  // AVAILABLE partners can receive orders.
  // BUSY partners can also receive orders if they
  // still have capacity in their current trip.
  const partners = await DeliveryPerson.find({
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

  if (!partners.length) {
    return [];
  }

  const activeOrderCounts = await getActiveOrderCounts(
    partners.map((partner) => partner._id),
  );

  return partners
    .filter((partner) => {
      const partnerId = String(partner._id);

      // Don't immediately offer the same order back
      // to a partner who rejected it.
      if (excludedIds.has(partnerId)) {
        return false;
      }

      const activeCount = activeOrderCounts.get(partnerId) || 0;

      return activeCount < MAX_ACTIVE_ORDERS_PER_TRIP;
    })
    .map((partner) => {
      const partnerLatitude = Number(partner.currentLocation?.latitude);

      const partnerLongitude = Number(partner.currentLocation?.longitude);

      const distance = calculateDistanceKm(
        partnerLatitude,
        partnerLongitude,
        shopLatitude,
        shopLongitude,
      );

      return { partner, distance };
    })
    .filter(
      (candidate) =>
        Number.isFinite(candidate.distance) &&
        candidate.distance <= DP_TO_SHOP_MAX_DISTANCE_KM,
    )
    .sort((a, b) => a.distance - b.distance);
}

// ==========================================
// OFFER RMA ORDER TO NEXT PARTNER
// ==========================================

async function offerRmaOrderToNextPartner(
  order,
  excludedDeliveryPersonIds = [],
) {
  const candidates = await findEligibleRmaDeliveryPartners(
    order,
    excludedDeliveryPersonIds,
  );

  if (!candidates.length) {
    return {
      success: false,
      status: 'NO_PARTNER_AVAILABLE',
      message:
        'No eligible RMA delivery partner with available trip capacity was found nearby.',
    };
  }

  for (const candidate of candidates) {
    // Recheck the partner immediately before offering.
    const deliveryPerson = await DeliveryPerson.findOne({
      _id: candidate.partner._id,
      deliveryType: 'RMA',
      applicationStatus: 'APPROVED',
      isActive: true,
      availabilityStatus: { $in: ['AVAILABLE', 'BUSY'] },
      'currentLocation.updatedAt': {
        $gte: new Date(Date.now() - DISPATCH_LOCATION_MAX_AGE_MS),
      },
    });

    if (!deliveryPerson) {
      continue;
    }

    const activeOrderCounts = await getActiveOrderCounts([deliveryPerson._id]);

    const activeCount = activeOrderCounts.get(String(deliveryPerson._id)) || 0;

    if (activeCount >= MAX_ACTIVE_ORDERS_PER_TRIP) {
      continue;
    }

    // Prevent overwriting an order that another dispatch
    // operation has already reassigned or changed.
    const updatedOrder = await Order.findOneAndUpdate(
      {
        _id: order._id,
        deliveryAssignmentType: 'RMA',
        deliveryAssignmentStatus: { $in: ['PENDING', 'REJECTED'] },
        status: 'Ready',
        orderType: 'delivery',
      },
      {
        $set: {
          deliveryAssignmentType: 'RMA',
          deliveryPersonId: deliveryPerson._id,
          deliveryAssignmentStatus: 'PENDING',
          deliveryPickupStatus: 'PENDING',
          deliveryOtp: null,
          deliveryOtpGeneratedAt: null,
          otpVerified: false,
        },
      },
      { new: true },
    );

    if (!updatedOrder) {
      return {
        success: false,
        status: 'ORDER_ASSIGNMENT_CHANGED',
        message:
          'The order assignment changed before a delivery partner could be selected.',
      };
    }

    try {
      await createAndSendNotification({
        recipientType: 'delivery',
        recipientId: deliveryPerson._id,
        type: 'DELIVERY_ASSIGNMENT_REQUEST',
        title: 'New Delivery Request',
        message: `Order ${updatedOrder.orderId} is waiting for your response.`,
        orderId: updatedOrder.orderId,
        data: {
          screen: 'delivery-orders',
          orderId: updatedOrder.orderId,
          assignmentStatus: 'PENDING',
          deliveryAssignmentType: 'RMA',
          activeOrderCount: activeCount,
          maxActiveOrders: MAX_ACTIVE_ORDERS_PER_TRIP,
        },
      });
    } catch (notificationError) {
      console.error(
        'RMA delivery assignment notification failed:',
        notificationError,
      );
    }

    return {
      success: true,
      status: 'WAITING_FOR_ACCEPTANCE',
      deliveryPersonId: deliveryPerson._id,
      distance: Number(candidate.distance.toFixed(4)),
      activeOrderCount: activeCount,
      maxActiveOrders: MAX_ACTIVE_ORDERS_PER_TRIP,
    };
  }

  return {
    success: false,
    status: 'NO_PARTNER_AVAILABLE',
    message:
      'No eligible RMA delivery partner with available trip capacity was found nearby.',
  };
}

// ==========================================
// EXPORTS
// ==========================================

module.exports = {
  calculateDistanceKm,
  getActiveOrderCounts,
  findEligibleRmaDeliveryPartners,
  offerRmaOrderToNextPartner,
  MAX_ACTIVE_ORDERS_PER_TRIP,
};
