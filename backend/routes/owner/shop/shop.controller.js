const Owner = require('../../../models/Owner');
const getShopStatus = require('../../../utils/shopStatus');

// GENERATE UNIQUE REFERRAL CODE
async function getOrCreateReferralCode(owner) {
  if (owner.referralCode) {
    return owner.referralCode;
  }

  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

  let referralCode;
  let exists = true;

  while (exists) {
    let randomPart = '';

    for (let i = 0; i < 8; i += 1) {
      randomPart += characters.charAt(
        Math.floor(Math.random() * characters.length),
      );
    }

    referralCode = `RMA-${randomPart}`;

    exists = await Owner.exists({ referralCode });
  }

  owner.referralCode = referralCode;
  await owner.save();

  return referralCode;
}

// GET ALL OWNERS
async function getAllOwners(req, res) {
  try {
    const owners = await Owner.find().select('-password');

    res.status(200).json({
      owners,
    });
  } catch (error) {
    console.error('Get owners failed:', error.message);

    res.status(500).json({
      message: 'Server error',
    });
  }
}

// GET NEARBY SHOPS
async function getNearbyShops(req, res) {
  try {
    const { latitude, longitude } = req.query;

    const customerLatitude = Number(latitude);
    const customerLongitude = Number(longitude);

    if (
      !Number.isFinite(customerLatitude) ||
      !Number.isFinite(customerLongitude)
    ) {
      return res.status(400).json({
        message: 'Valid latitude and longitude are required',
      });
    }

    if (
      customerLatitude < -90 ||
      customerLatitude > 90 ||
      customerLongitude < -180 ||
      customerLongitude > 180
    ) {
      return res.status(400).json({
        message: 'Invalid location coordinates',
      });
    }

    const shops = await Owner.find({
      'location.latitude': { $ne: null },
      'location.longitude': { $ne: null },
    }).select(
      'shopId shopName description address location isOpen delivery pickup deliverySettings products statusOverride statusOverrideAt',
    );

    const toRadians = (degrees) => (degrees * Math.PI) / 180;

    const calculateDistance = (customerLat, customerLng, shopLat, shopLng) => {
      const earthRadiusKm = 6371;

      const latitudeDifference = toRadians(shopLat - customerLat);
      const longitudeDifference = toRadians(shopLng - customerLng);

      const a =
        Math.sin(latitudeDifference / 2) ** 2 +
        Math.cos(toRadians(customerLat)) *
          Math.cos(toRadians(shopLat)) *
          Math.sin(longitudeDifference / 2) ** 2;

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      return earthRadiusKm * c;
    };

    const nearbyShops = shops
      .map((shop) => {
        const distance = calculateDistance(
          customerLatitude,
          customerLongitude,
          shop.location.latitude,
          shop.location.longitude,
        );

        const currentIsOpen = getShopStatus(shop);

        return {
          shopId: shop.shopId,
          shopName: shop.shopName,
          description: shop.description,
          address: shop.address,
          location: shop.location,
          isOpen: currentIsOpen,
          delivery: shop.delivery,
          pickup: shop.pickup,
          deliverySettings: shop.deliverySettings,
          distance: Number(distance.toFixed(2)),
          products: shop.products,
        };
      })
      .filter((shop) => shop.distance <= 5)
      .sort((a, b) => a.distance - b.distance);

    return res.status(200).json({
      shops: nearbyShops,
    });
  } catch (error) {
    console.error('Nearby shops fetch failed:', error);

    return res.status(500).json({
      message: 'Failed to fetch nearby shops',
    });
  }
}

// GET SHOP BY SHOP ID
async function getShopById(req, res) {
  try {
    const { shopId } = req.params;

    const owner = await Owner.findOne({ shopId }).select('-password');

    if (!owner) {
      return res.status(404).json({
        message: 'Shop not found',
      });
    }

    const currentIsOpen = getShopStatus(owner);

    return res.status(200).json({
      shop: {
        ...owner.toObject(),
        isOpen: currentIsOpen,
      },
    });
  } catch (error) {
    console.error('Get shop failed:', error.message);

    res.status(500).json({
      message: 'Server error',
    });
  }
}

// GET OWNER REFERRAL CODE
async function getOwnerReferralCode(req, res) {
  try {
    const { ownerId } = req.params;

    const owner = await Owner.findById(ownerId);

    if (!owner) {
      return res.status(404).json({
        message: 'Owner not found',
      });
    }

    const referralCode = await getOrCreateReferralCode(owner);

    return res.status(200).json({
      referralCode,
    });
  } catch (error) {
    console.error('Get owner referral code failed:', error);

    return res.status(500).json({
      message: 'Failed to get referral code',
    });
  }
}

module.exports = {
  getAllOwners,
  getNearbyShops,
  getShopById,
  getOwnerReferralCode,
};
