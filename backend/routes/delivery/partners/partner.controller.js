const DeliveryPerson = require('../../../models/DeliveryPerson');
const Order = require('../../../models/Order');

// ==========================================
// GET AVAILABLE DELIVERY PARTNERS
// FOR AN OWNER'S ORDER
// ==========================================
const getAvailableDeliveryPartners = async (req, res) => {
  try {
    const { orderId } = req.params;

    const owner = req.owner;

    // FIND THE ORDER
    const order = await Order.findOne({
      orderId,
      ownerId: owner._id,
      orderType: 'delivery',
      status: 'Ready',
    }).populate('ownerId', 'ownerName shopName phone shopId location');

    if (!order) {
      return res.status(404).json({
        message: 'Ready delivery order not found',
      });
    }

    // GET SHOP LOCATION
    const shopLocation = order.ownerId?.location;

    if (
      !shopLocation ||
      shopLocation.latitude == null ||
      shopLocation.longitude == null
    ) {
      return res.status(400).json({
        message: 'Shop location is not available',
      });
    }

    const shopLatitude = Number(shopLocation.latitude);
    const shopLongitude = Number(shopLocation.longitude);

    // --------------------------------------------------
    // SHOP DELIVERY PARTNERS
    // --------------------------------------------------

    const shopPartners = await DeliveryPerson.find({
      deliveryType: 'SHOP',
      ownerId: owner._id,
      isActive: true,
    }).select('name phone shopId deliveryType isActive currentLocation');

    // --------------------------------------------------
    // RMA DELIVERY PARTNERS
    // --------------------------------------------------

    const rmaPartners = await DeliveryPerson.find({
      deliveryType: 'RMA',
      isActive: true,
      'currentLocation.latitude': { $ne: null },
      'currentLocation.longitude': { $ne: null },
      'currentLocation.updatedAt': {
        $gte: new Date(Date.now() - 10 * 60 * 1000),
      },
    }).select('name phone deliveryType isActive currentLocation');

    // --------------------------------------------------
    // HAVERSINE DISTANCE FUNCTION
    // --------------------------------------------------

    const calculateDistanceKm = (
      latitude1,
      longitude1,
      latitude2,
      longitude2,
    ) => {
      const earthRadiusKm = 6371;

      const lat1 = (latitude1 * Math.PI) / 180;
      const lat2 = (latitude2 * Math.PI) / 180;

      const deltaLat = ((latitude2 - latitude1) * Math.PI) / 180;

      const deltaLongitude = ((longitude2 - longitude1) * Math.PI) / 180;

      const a =
        Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(lat1) *
          Math.cos(lat2) *
          Math.sin(deltaLongitude / 2) *
          Math.sin(deltaLongitude / 2);

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      return earthRadiusKm * c;
    };

    // --------------------------------------------------
    // CALCULATE RMA RIDER DISTANCE FROM SHOP
    // --------------------------------------------------

    const nearbyRmaPartners = rmaPartners
      .map((partner) => {
        const latitude = Number(partner.currentLocation?.latitude);

        const longitude = Number(partner.currentLocation?.longitude);

        const distance = calculateDistanceKm(
          shopLatitude,
          shopLongitude,
          latitude,
          longitude,
        );

        return {
          id: partner._id,
          name: partner.name,
          phone: partner.phone,
          deliveryType: partner.deliveryType,
          isActive: partner.isActive,
          distance: Number(distance.toFixed(2)),
        };
      })
      // Only riders within 5 KM
      .filter((partner) => partner.distance <= 5)
      // Nearest rider first
      .sort((a, b) => a.distance - b.distance)
      // Maximum 5 riders
      .slice(0, 5);

    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------

    return res.status(200).json({
      order: {
        orderId: order.orderId,
      },

      shop: {
        shopId: order.ownerId.shopId,
        shopName: order.ownerId.shopName,
        location: {
          latitude: shopLatitude,
          longitude: shopLongitude,
        },
      },

      shopPartners: shopPartners.map((partner) => ({
        id: partner._id,
        name: partner.name,
        phone: partner.phone,
        deliveryType: partner.deliveryType,
        isActive: partner.isActive,
      })),

      rmaPartners: nearbyRmaPartners,
    });
  } catch (error) {
    console.error('Get available delivery partners failed:', error);

    return res.status(500).json({
      message: 'Server error',
    });
  }
};

module.exports = {
  getAvailableDeliveryPartners,
};
