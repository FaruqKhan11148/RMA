const express = require('express');
const crypto = require('crypto');

const DeliveryPerson = require('../models/DeliveryPerson');
const Owner = require('../models/Owner');
const Order = require('../models/Order');
const deliveryAuth = require('../middleware/deliveryAuth');
const ownerAuth = require('../middleware/ownerAuth');

const router = express.Router();

// REGISTER DELIVERY PERSON
router.post('/register', ownerAuth, async (req, res) => {
  try {
    const { name, phone } = req.body;

    const shopId = req.owner.shopId;

    // VALIDATION

    if (!name || !phone) {
      return res.status(400).json({
        message: 'Name and phone are required',
      });
    }

    // FIND SHOP

    const owner = await Owner.findOne({ shopId });

    if (!owner) {
      return res.status(404).json({
        message: 'Shop not found',
      });
    }

    // CHECK IF DELIVERY PERSON ALREADY EXISTS

    const existingDeliveryPerson = await DeliveryPerson.findOne({
      shopId,
    });

    if (existingDeliveryPerson) {
      return res.status(409).json({
        message: 'A delivery person is already registered for this shop',
      });
    }

    // CHECK PHONE

    const existingPhone = await DeliveryPerson.findOne({
      phone,
    });

    if (existingPhone) {
      return res.status(409).json({
        message: 'This phone number is already registered',
      });
    }

    // CREATE DELIVERY PERSON

    const deliveryPerson = await DeliveryPerson.create({
      ownerId: owner._id,
      shopId: owner.shopId,
      name,
      phone,
      isActive: true,
    });

    // SAFE RESPONSE

    res.status(201).json({
      message: 'Delivery person registered successfully',

      deliveryPerson: {
        id: deliveryPerson._id,
        shopId: deliveryPerson.shopId,
        name: deliveryPerson.name,
        phone: deliveryPerson.phone,
        isActive: deliveryPerson.isActive,
      },
    });
  } catch (error) {
    console.error('Register delivery person error:', error);

    res.status(500).json({
      message: 'Server error',
    });
  }
});

// GET DELIVERY PERSON FOR LOGGED-IN OWNER
router.get('/person', ownerAuth, async (req, res) => {
  try {
    const shopId = req.owner.shopId;

    const deliveryPerson = await DeliveryPerson.findOne({
      shopId,
    }).select('name phone shopId isActive currentLocation createdAt');

    if (!deliveryPerson) {
      return res.status(404).json({
        message: 'No delivery person registered for this shop',
      });
    }

    res.status(200).json({
      deliveryPerson: {
        id: deliveryPerson._id,
        shopId: deliveryPerson.shopId,
        name: deliveryPerson.name,
        phone: deliveryPerson.phone,
        isActive: deliveryPerson.isActive,
        currentLocation: deliveryPerson.currentLocation,
        createdAt: deliveryPerson.createdAt,
      },
    });
  } catch (error) {
    console.error('Get delivery person failed:', error);

    res.status(500).json({
      message: 'Server error',
    });
  }
});

// Activate / deactivate delivery person
router.patch('/person/status', ownerAuth, async (req, res) => {
  try {
    const { isActive } = req.body;
    const shopId = req.owner.shopId;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        message: 'isActive must be true or false',
      });
    }

    const deliveryPerson = await DeliveryPerson.findOne({ shopId });

    if (!deliveryPerson) {
      return res.status(404).json({
        message: 'No delivery person registered for this shop',
      });
    }

    deliveryPerson.isActive = isActive;

    await deliveryPerson.save();

    res.status(200).json({
      message: isActive
        ? 'Delivery person activated successfully'
        : 'Delivery person deactivated successfully',

      deliveryPerson: {
        id: deliveryPerson._id,
        shopId: deliveryPerson.shopId,
        name: deliveryPerson.name,
        phone: deliveryPerson.phone,
        isActive: deliveryPerson.isActive,
      },
    });
  } catch (error) {
    console.error('Update delivery person status error:', error);

    res.status(500).json({
      message: 'Failed to update delivery person status',
    });
  }
});

// UPDATE DELIVERY PERSON DETAILS
router.patch('/person', ownerAuth, async (req, res) => {
  try {
    const { name, phone } = req.body;
    const shopId = req.owner.shopId;

    if (!name || !phone) {
      return res.status(400).json({
        message: 'Name and phone are required',
      });
    }

    if (phone.length !== 10) {
      return res.status(400).json({
        message: 'Phone number must be 10 digits',
      });
    }

    const deliveryPerson = await DeliveryPerson.findOne({
      shopId,
    });

    if (!deliveryPerson) {
      return res.status(404).json({
        message: 'No delivery person registered for this shop',
      });
    }

    const existingPhone = await DeliveryPerson.findOne({
      phone,
      _id: { $ne: deliveryPerson._id },
    });

    if (existingPhone) {
      return res.status(409).json({
        message: 'This phone number is already registered',
      });
    }

    deliveryPerson.name = name.trim();
    deliveryPerson.phone = phone.trim();

    await deliveryPerson.save();

    res.status(200).json({
      message: 'Delivery person updated successfully',

      deliveryPerson: {
        id: deliveryPerson._id,
        shopId: deliveryPerson.shopId,
        name: deliveryPerson.name,
        phone: deliveryPerson.phone,
        isActive: deliveryPerson.isActive,
      },
    });
  } catch (error) {
    console.error('Update delivery person error:', error);

    res.status(500).json({
      message: 'Failed to update delivery person',
    });
  }
});

// REQUEST DELIVERY LOGIN OTP
router.post('/request-otp', async (req, res) => {
  try {
    const { shopId, phone } = req.body;

    // VALIDATION
    if (!shopId || !phone) {
      return res.status(400).json({
        message: 'Shop ID and phone are required',
      });
    }

    // FIND DELIVERY PERSON
    const deliveryPerson = await DeliveryPerson.findOne({
      shopId,
      phone,
    });

    if (!deliveryPerson) {
      return res.status(404).json({
        message: 'Delivery person not found for this shop',
      });
    }

    // CHECK ACTIVE
    if (!deliveryPerson.isActive) {
      return res.status(403).json({
        message: 'Delivery person account is inactive',
      });
    }

    // GENERATE 6 DIGIT OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // OTP VALID FOR 5 MINUTES
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    deliveryPerson.otp = otp;
    deliveryPerson.otpExpiresAt = otpExpiresAt;

    await deliveryPerson.save();

    console.log(`Delivery login OTP for ${phone}: ${otp}`);

    res.status(200).json({
      message: 'OTP sent successfully',

      // ONLY FOR LOCAL TESTING
      // Remove this in production.
      otp,
    });
  } catch (error) {
    console.error('Request delivery OTP error:', error);

    res.status(500).json({
      message: 'Server error',
    });
  }
});

// VERIFY DELIVERY PERSON LOGIN OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { shopId, phone, otp } = req.body;

    if (!shopId || !phone || !otp) {
      return res.status(400).json({
        message: 'Shop ID, phone and OTP are required',
      });
    }

    const deliveryPerson = await DeliveryPerson.findOne({
      shopId,
      phone,
    });

    if (!deliveryPerson) {
      return res.status(404).json({
        message: 'Delivery person not found for this shop',
      });
    }

    if (!deliveryPerson.isActive) {
      return res.status(403).json({
        message: 'Delivery person account is inactive',
      });
    }

    // Check whether an OTP was requested
    if (!deliveryPerson.otp || !deliveryPerson.otpExpiresAt) {
      return res.status(400).json({
        message: 'No OTP requested',
      });
    }

    // Check OTP expiry
    if (new Date() > deliveryPerson.otpExpiresAt) {
      deliveryPerson.otp = null;
      deliveryPerson.otpExpiresAt = null;

      await deliveryPerson.save();

      return res.status(400).json({
        message: 'OTP has expired. Please request a new OTP',
      });
    }

    // Check OTP
    if (deliveryPerson.otp !== String(otp)) {
      return res.status(400).json({
        message: 'Invalid OTP',
      });
    }

    // OTP verified successfully

    // Generate secure login token
    // Generate secure login token
    const loginToken = crypto.randomBytes(32).toString('hex');

    // Login session valid for 7 days
    const loginTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    deliveryPerson.otp = null;
    deliveryPerson.otpExpiresAt = null;
    deliveryPerson.loginToken = loginToken;
    deliveryPerson.loginTokenExpiresAt = loginTokenExpiresAt;

    await deliveryPerson.save();

    res.status(200).json({
      message: 'Delivery person login successful',

      token: loginToken,

      deliveryPerson: {
        id: deliveryPerson._id,
        shopId: deliveryPerson.shopId,
        name: deliveryPerson.name,
        phone: deliveryPerson.phone,
        isActive: deliveryPerson.isActive,
      },
    });
  } catch (error) {
    console.error('Verify delivery login OTP error:', error);

    res.status(500).json({
      message: 'Server error',
    });
  }
});

// GET DELIVERY ORDERS FOR LOGGED-IN DELIVERY PERSON
router.get('/orders', deliveryAuth, async (req, res) => {
  try {
    const deliveryPerson = req.deliveryPerson;

    const orders = await Order.find({
      ownerId: deliveryPerson.ownerId,
      status: 'OutForDelivery',
      orderType: 'delivery',
    })
      .populate('ownerId', 'ownerName shopName phone shopId location')
      .sort({ createdAt: -1 });

    res.status(200).json({
      orders,
    });
  } catch (error) {
    console.error('Get delivery orders failed:', error);

    res.status(500).json({
      message: 'Server error',
    });
  }
});

// GET DELIVERY DASHBOARD SUMMARY
// GET DELIVERY DASHBOARD SUMMARY
router.get('/dashboard', deliveryAuth, async (req, res) => {
  try {
    const deliveryPerson = req.deliveryPerson;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const baseQuery = {
      ownerId: deliveryPerson.ownerId,
      orderType: 'delivery',
    };

    // TODAY'S ORDERS
    const todayOrders = await Order.find({
      ...baseQuery,
      createdAt: {
        $gte: startOfToday,
        $lte: endOfToday,
      },
    })
      .populate('ownerId', 'ownerName shopName phone shopId location')
      .sort({ createdAt: -1 });

    // PENDING DELIVERIES
    const pendingOrders = todayOrders.filter(
      (order) => order.status === 'OutForDelivery',
    );

    // COMPLETED TODAY
    const completedTodayOrders = todayOrders.filter(
      (order) => order.status === 'Completed',
    );

    // ALL-TIME DELIVERED ORDERS
    const allDeliveredOrders = await Order.find({
      ...baseQuery,
      status: 'Completed',
    })
      .populate('ownerId', 'ownerName shopName phone shopId location')
      .sort({ completedAt: -1 });

    res.status(200).json({
      today: {
        orders: todayOrders.length,
        pending: pendingOrders.length,
        completed: completedTodayOrders.length,
      },

      allTime: {
        delivered: allDeliveredOrders.length,
      },

      orders: {
        today: todayOrders,
        pending: pendingOrders,
        completedToday: completedTodayOrders,
        allDelivered: allDeliveredOrders,
      },

      summary: {
        distance: null,
        earnings: null,
      },
    });
  } catch (error) {
    console.error('Get delivery dashboard failed:', error);

    res.status(500).json({
      message: 'Server error',
    });
  }
});

// GET ROAD ROUTE FOR A DELIVERY ORDER
router.get('/route/:orderId', deliveryAuth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const deliveryPerson = req.deliveryPerson;

    const order = await Order.findOne({
      orderId,
      ownerId: deliveryPerson.ownerId,
      status: 'OutForDelivery',
      orderType: 'delivery',
    }).populate('ownerId', 'ownerName shopName phone shopId location');

    if (!order) {
      return res.status(404).json({
        message: 'Delivery order not found',
      });
    }

    const deliveryPersonLocation = deliveryPerson.currentLocation;

    const customerLocation = order.deliveryLocation;

    if (
      !deliveryPersonLocation ||
      deliveryPersonLocation.latitude == null ||
      deliveryPersonLocation.longitude == null
    ) {
      return res.status(400).json({
        message: 'Delivery persons current location is not available',
      });
    }

    if (
      !customerLocation ||
      customerLocation.latitude == null ||
      customerLocation.longitude == null
    ) {
      return res.status(400).json({
        message: 'Customer delivery location is not available',
      });
    }

    // GET REAL ROAD ROUTE FROM HEIGIT / OPENROUTESERVICE
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
            [deliveryPersonLocation.longitude, deliveryPersonLocation.latitude],
            [customerLocation.longitude, customerLocation.latitude],
          ],
        }),
      },
    );

    const routingData = await routingResponse.json();

    if (!routingResponse.ok) {
      console.error('HEIGIT routing error:', routingData);

      return res.status(502).json({
        message: 'Unable to calculate delivery route',
        details: routingData,
      });
    }

    if (
      !routingData.features ||
      !routingData.features.length ||
      !routingData.features[0].properties ||
      !routingData.features[0].geometry
    ) {
      return res.status(502).json({
        message: 'Invalid route response',
      });
    }

    const routeFeature = routingData.features[0];

    const distanceMeters = routeFeature.properties.summary.distance;

    const durationSeconds = routeFeature.properties.summary.duration;

    const distanceKm = distanceMeters / 1000;

    const durationMinutes = durationSeconds / 60;

    res.status(200).json({
      message: 'Delivery route calculated successfully',

      route: {
        orderId: order.orderId,

        origin: {
          latitude: deliveryPersonLocation.latitude,
          longitude: deliveryPersonLocation.longitude,
        },

        destination: {
          latitude: customerLocation.latitude,
          longitude: customerLocation.longitude,
        },

        distance: {
          meters: Math.round(distanceMeters),
          kilometers: Number(distanceKm.toFixed(2)),
        },

        duration: {
          seconds: Math.round(durationSeconds),
          minutes: Math.round(durationMinutes),
        },

        geometry: routeFeature.geometry,
      },
    });
  } catch (error) {
    console.error('Get delivery route failed:', error);

    res.status(500).json({
      message: 'Server error',
    });
  }
});

router.post('/location', deliveryAuth, async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return res.status(400).json({
        message: 'Valid latitude and longitude are required',
      });
    }

    if (
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return res.status(400).json({
        message: 'Invalid GPS coordinates',
      });
    }

    const deliveryPerson = await DeliveryPerson.findByIdAndUpdate(
      req.deliveryPerson._id,
      {
        currentLocation: {
          latitude,
          longitude,
          updatedAt: new Date(),
        },
      },
      {
        new: true,
      },
    ).select('name phone shopId currentLocation');

    if (!deliveryPerson) {
      return res.status(404).json({
        message: 'Delivery person not found',
      });
    }

    res.status(200).json({
      message: 'Delivery location updated successfully',

      currentLocation: deliveryPerson.currentLocation,
    });
  } catch (error) {
    console.error('Update delivery location failed:', error);

    res.status(500).json({
      message: 'Server error',
    });
  }
});

module.exports = router;
