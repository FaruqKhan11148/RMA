const DeliveryPerson = require('../../../models/DeliveryPerson');

const getDeliveryAvailability = async (req, res) => {
  try {
    const deliveryPerson = await DeliveryPerson.findById(
      req.deliveryPerson._id,
    ).select(
      'deliveryType name phone isActive applicationStatus availabilityStatus lastOnlineAt lastOfflineAt lastAvailabilityChangedAt currentLocation',
    );

    if (!deliveryPerson) {
      return res.status(404).json({
        message: 'Delivery partner not found',
      });
    }

    return res.status(200).json({
      success: true,
      availabilityStatus: deliveryPerson.availabilityStatus,
      applicationStatus: deliveryPerson.applicationStatus,
      isActive: deliveryPerson.isActive,
      lastOnlineAt: deliveryPerson.lastOnlineAt,
      lastOfflineAt: deliveryPerson.lastOfflineAt,
      lastAvailabilityChangedAt: deliveryPerson.lastAvailabilityChangedAt,
      currentLocation: deliveryPerson.currentLocation,
    });
  } catch (error) {
    console.error('Get delivery availability error:', error);

    return res.status(500).json({
      message: 'Unable to get availability status',
    });
  }
};

const updateDeliveryAvailability = async (req, res) => {
  try {
    const { availabilityStatus } = req.body;

    if (!['OFFLINE', 'AVAILABLE'].includes(availabilityStatus)) {
      return res.status(400).json({
        message: 'Invalid availability status',
      });
    }

    const deliveryPerson = await DeliveryPerson.findById(
      req.deliveryPerson._id,
    );

    if (!deliveryPerson) {
      return res.status(404).json({
        message: 'Delivery partner not found',
      });
    }

    if (!deliveryPerson.isActive) {
      return res.status(403).json({
        message: 'Your delivery partner account is inactive',
      });
    }

    if (deliveryPerson.applicationStatus !== 'APPROVED') {
      return res.status(403).json({
        message: 'Your delivery partner application is not approved',
      });
    }

    if (
      availabilityStatus === 'OFFLINE' &&
      deliveryPerson.availabilityStatus === 'BUSY'
    ) {
      return res.status(409).json({
        message: 'You cannot go offline while you have an active delivery',
      });
    }

    if (availabilityStatus === deliveryPerson.availabilityStatus) {
      return res.status(200).json({
        success: true,
        message: `You are already ${availabilityStatus.toLowerCase()}`,
        availabilityStatus: deliveryPerson.availabilityStatus,
      });
    }

    const now = new Date();

    deliveryPerson.availabilityStatus = availabilityStatus;
    deliveryPerson.lastAvailabilityChangedAt = now;

    if (availabilityStatus === 'AVAILABLE') {
      deliveryPerson.lastOnlineAt = now;
    }

    if (availabilityStatus === 'OFFLINE') {
      deliveryPerson.lastOfflineAt = now;
    }

    await deliveryPerson.save();

    return res.status(200).json({
      success: true,
      message:
        availabilityStatus === 'AVAILABLE'
          ? 'You are now available for deliveries'
          : 'You are now offline',
      availabilityStatus: deliveryPerson.availabilityStatus,
      lastOnlineAt: deliveryPerson.lastOnlineAt,
      lastOfflineAt: deliveryPerson.lastOfflineAt,
      lastAvailabilityChangedAt: deliveryPerson.lastAvailabilityChangedAt,
    });
  } catch (error) {
    console.error('Update delivery availability error:', error);

    return res.status(500).json({
      message: 'Unable to update availability',
    });
  }
};

module.exports = {
  getDeliveryAvailability,
  updateDeliveryAvailability,
};
