const Order = require('../../../models/Order');
const Owner = require('../../../models/Owner');
const DeliveryPerson = require('../../../models/DeliveryPerson');

const getDistanceInKm = (lat1, lon1, lat2, lon2) => {
  const earthRadiusKm = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
};

const getAvailableDeliveryPartners = async (req, res) => {
  try {
    const { orderId } = req.params;

    const owner = req.owner;

    if (!owner) {
      return res.status(401).json({
        message: 'Owner authentication required',
      });
    }

    const order = await Order.findOne({
      orderId,
      ownerId: owner._id,
      status: 'Ready',
      orderType: 'delivery',
    });

    if (!order) {
      return res.status(404).json({
        message: 'Ready delivery order not found',
      });
    }

    const shop = await Owner.findById(owner._id).select(
      'shopName shopAddress location latitude longitude',
    );

    if (!shop) {
      return res.status(404).json({
        message: 'Shop not found',
      });
    }

    let shopLatitude = null;
    let shopLongitude = null;

    if (
      shop.location &&
      typeof shop.location.latitude === 'number' &&
      typeof shop.location.longitude === 'number'
    ) {
      shopLatitude = shop.location.latitude;
      shopLongitude = shop.location.longitude;
    } else if (
      typeof shop.latitude === 'number' &&
      typeof shop.longitude === 'number'
    ) {
      shopLatitude = shop.latitude;
      shopLongitude = shop.longitude;
    }

    if (typeof shopLatitude !== 'number' || typeof shopLongitude !== 'number') {
      return res.status(400).json({
        message: 'Shop location is not available',
      });
    }

    /*
     * SHOP DELIVERY PARTNERS
     *
     * These belong directly to this owner/shop.
     */
    const shopPartners = await DeliveryPerson.find({
      deliveryType: 'SHOP',
      ownerId: owner._id,
      isActive: true,
    })
      .select(
        'name phone deliveryType isActive availabilityStatus currentLocation',
      )
      .lean();

    /*
     * RMA DELIVERY PARTNERS
     *
     * Only partners who are:
     * - RMA partners
     * - active account
     * - application approved
     * - currently available
     * - have a valid current location
     * - location updated within the last 10 minutes
     */
    const locationCutoff = new Date(Date.now() - 10 * 60 * 1000);

    const rmaPartners = await DeliveryPerson.find({
      deliveryType: 'RMA',
      isActive: true,
      applicationStatus: 'APPROVED',
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
        'name phone deliveryType isActive applicationStatus availabilityStatus currentLocation',
      )
      .lean();

    /*
     * Calculate distance from shop to each RMA partner.
     */
    const eligibleRmaPartners = rmaPartners
      .map((partner) => {
        const distance = getDistanceInKm(
          shopLatitude,
          shopLongitude,
          partner.currentLocation.latitude,
          partner.currentLocation.longitude,
        );

        return {
          id: partner._id,
          name: partner.name,
          phone: partner.phone,
          deliveryType: partner.deliveryType,
          isActive: partner.isActive,
          applicationStatus: partner.applicationStatus,
          availabilityStatus: partner.availabilityStatus,
          distance: Number(distance.toFixed(4)),
          currentLocation: partner.currentLocation,
        };
      })
      .filter((partner) => partner.distance <= 5)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5);

    return res.status(200).json({
      success: true,

      order: {
        orderId: order.orderId,
        status: order.status,
        orderType: order.orderType,
      },

      shop: {
        shopName: shop.shopName,
        latitude: shopLatitude,
        longitude: shopLongitude,
      },

      shopPartners: shopPartners.map((partner) => ({
        id: partner._id,
        name: partner.name,
        phone: partner.phone,
        deliveryType: partner.deliveryType,
        isActive: partner.isActive,
        availabilityStatus: partner.availabilityStatus,
      })),

      rmaPartners: eligibleRmaPartners,
    });
  } catch (error) {
    console.error('Get available delivery partners error:', error);

    return res.status(500).json({
      message: 'Unable to fetch available delivery partners',
    });
  }
};

module.exports = {
  getAvailableDeliveryPartners,
};
