const Order = require('../models/Order');
const DeliveryPerson = require('../models/DeliveryPerson');

const { createAndSendNotification } = require('./notificationService');

const DISPATCH_LOCATION_MAX_AGE_MS = 10 * 60 * 1000;
const DP_TO_SHOP_MAX_DISTANCE_KM = 5;

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
// FIND ELIGIBLE RMA DELIVERY PARTNERS
// ==========================================

async function findEligibleRmaDeliveryPartners(
  order,
  excludedDeliveryPersonIds = [],
) {
  const locationCutoff = new Date(Date.now() - DISPATCH_LOCATION_MAX_AGE_MS);

  const excludedIds = new Set(
    excludedDeliveryPersonIds.map((id) => String(id)),
  );

  const partners = await DeliveryPerson.find({
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

  if (!partners.length) {
    return [];
  }

  // ==========================================
  // V1 ACTIVE DELIVERY CHECK
  // ==========================================
  //
  // For V1, an RMA DP already handling an active
  // delivery is excluded from a new dispatch.
  //
  // IMPORTANT:
  // This is intentionally isolated here so later
  // we can replace it with batch/route compatibility.
  //

  const activeOrders = await Order.find({
    deliveryPersonId: {
      $in: partners.map((partner) => partner._id),
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
  // SHOP LOCATION
  // ==========================================

  const shopLatitude = Number(order.pickupLocation?.latitude);

  const shopLongitude = Number(order.pickupLocation?.longitude);

  if (!Number.isFinite(shopLatitude) || !Number.isFinite(shopLongitude)) {
    return [];
  }

  // ==========================================
  // FILTER + CALCULATE DISTANCE
  // ==========================================

  return partners
    .filter((partner) => {
      const partnerId = String(partner._id);

      // Do not offer this order again to a DP who
      // already rejected it.
      if (excludedIds.has(partnerId)) {
        return false;
      }

      // V1: DP already handling an active delivery.
      if (busyPartnerIds.has(partnerId)) {
        return false;
      }

      return true;
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

      return {
        partner,
        distance,
      };
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
      message: 'No RMA delivery partner is currently available nearby',
    };
  }

  // ==========================================
  // TRY CANDIDATES IN ORDER
  // ==========================================

  for (const candidate of candidates) {
    const deliveryPerson = await DeliveryPerson.findById(candidate.partner._id);

    if (!deliveryPerson) {
      continue;
    }

    // Re-check the partner because their state may
    // have changed between candidate discovery and
    // this point.
    if (
      deliveryPerson.deliveryType !== 'RMA' ||
      deliveryPerson.applicationStatus !== 'APPROVED' ||
      !deliveryPerson.isActive ||
      deliveryPerson.availabilityStatus !== 'AVAILABLE'
    ) {
      continue;
    }

    // ==========================================
    // ASSIGN PENDING OFFER
    // ==========================================

    order.deliveryAssignmentType = 'RMA';

    order.deliveryPersonId = deliveryPerson._id;

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
        recipientId: deliveryPerson._id,
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

    return {
      success: true,
      status: 'WAITING_FOR_ACCEPTANCE',
      deliveryPersonId: deliveryPerson._id,
      distance: Number(candidate.distance.toFixed(4)),
    };
  }

  // ==========================================
  // NO VALID PARTNER REMAINED
  // ==========================================

  return {
    success: false,
    status: 'NO_PARTNER_AVAILABLE',
    message: 'No RMA delivery partner is currently available nearby',
  };
}

// ==========================================
// EXPORTS
// ==========================================

module.exports = {
  calculateDistanceKm,
  findEligibleRmaDeliveryPartners,
  offerRmaOrderToNextPartner,
};
