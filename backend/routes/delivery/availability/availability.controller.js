const DeliveryPerson = require('../../../models/DeliveryPerson');

const {
  getActiveDeliveryOrderCount,
} = require('../../../services/deliveryWorkload.service');

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

    if (
      deliveryPerson.deliveryType === 'RMA' &&
      deliveryPerson.applicationStatus !== 'APPROVED'
    ) {
      const status = deliveryPerson.applicationStatus;

      const applicationMessages = {
        INCOMPLETE:
          'Complete your RMA Delivery Partner application before going online.',
        SUBMITTED:
          'Your application has been submitted and is awaiting review.',
        UNDER_REVIEW:
          'Your application is under review. You can go online after approval.',
        CORRECTION_REQUIRED:
          deliveryPerson.correctionReason ||
          'Your application needs corrections. Update and resubmit it before going online.',
        REJECTED:
          deliveryPerson.rejectionReason ||
          'Your application has been rejected. Please contact RMA support.',
      };

      return res.status(403).json({
        code: 'RMA_APPLICATION_NOT_APPROVED',
        applicationStatus: status,
        message:
          applicationMessages[status] ||
          'Your RMA Delivery Partner application must be approved before going online.',
        action: 'COMPLETE_APPLICATION',
      });
    }

    if (deliveryPerson.deliveryType !== 'RMA' && !deliveryPerson.isActive) {
      return res.status(403).json({
        message: 'Your delivery partner account is inactive',
      });
    }

    if (availabilityStatus === 'OFFLINE') {
      const activeOrderCount = await getActiveDeliveryOrderCount(
        deliveryPerson._id,
      );

      if (activeOrderCount > 0) {
        return res.status(409).json({
          message:
            'You cannot go offline while you have active deliveries. Complete your assigned deliveries first.',
          activeOrderCount,
        });
      }
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
