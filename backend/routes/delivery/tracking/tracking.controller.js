const DeliveryPerson = require('../../../models/DeliveryPerson');
const Order = require('../../../models/Order');

// ==========================================
// GET ROAD ROUTE FOR A DELIVERY ORDER
// ==========================================
const getDeliveryRoute = async (req, res) => {
  try {
    const { orderId } = req.params;
    const deliveryPerson = req.deliveryPerson;

    const order = await Order.findOne({
      orderId,
      deliveryPersonId: deliveryPerson._id,
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
};

// ==========================================
// UPDATE DELIVERY PERSON LOCATION
// ==========================================
const updateDeliveryLocation = async (req, res) => {
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
};

module.exports = {
  getDeliveryRoute,
  updateDeliveryLocation,
};
