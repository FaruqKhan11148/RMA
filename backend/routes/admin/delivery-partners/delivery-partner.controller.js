const DeliveryPerson = require('../../../models/DeliveryPerson');

// ============================================================
// GET PENDING RMA DELIVERY PARTNERS
// ============================================================

const getPendingDeliveryPartners = async (req, res) => {
  try {
    const pendingPartners = await DeliveryPerson.find({
      deliveryType: 'RMA',
      applicationStatus: 'PENDING',
    })
      .select('name phone deliveryType isActive applicationStatus createdAt')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      deliveryPartners: pendingPartners.map((partner) => ({
        id: partner._id,
        name: partner.name,
        phone: partner.phone,
        deliveryType: partner.deliveryType,
        isActive: partner.isActive,
        applicationStatus: partner.applicationStatus,
        createdAt: partner.createdAt,
      })),
    });
  } catch (error) {
    console.error('Pending RMA delivery partners fetch error:', error);

    return res.status(500).json({
      message: 'Failed to fetch pending delivery partners',
    });
  }
};

// ============================================================
// APPROVE RMA DELIVERY PARTNER
// ============================================================

const approveDeliveryPartner = async (req, res) => {
  try {
    const { deliveryPersonId } = req.params;

    const deliveryPerson = await DeliveryPerson.findOne({
      _id: deliveryPersonId,
      deliveryType: 'RMA',
    });

    if (!deliveryPerson) {
      return res.status(404).json({
        message: 'RMA delivery partner not found',
      });
    }

    deliveryPerson.isActive = true;
    deliveryPerson.applicationStatus = 'APPROVED';
    deliveryPerson.reviewedAt = new Date();
    deliveryPerson.rejectionReason = null;

    await deliveryPerson.save();

    return res.status(200).json({
      message: 'RMA delivery partner approved successfully',
      deliveryPerson: {
        id: deliveryPerson._id,
        name: deliveryPerson.name,
        phone: deliveryPerson.phone,
        deliveryType: deliveryPerson.deliveryType,
        isActive: deliveryPerson.isActive,
        applicationStatus: deliveryPerson.applicationStatus,
        reviewedAt: deliveryPerson.reviewedAt,
      },
    });
  } catch (error) {
    console.error('RMA delivery partner approval error:', error);

    return res.status(500).json({
      message: 'Server error',
    });
  }
};

const rejectDeliveryPartner = async (req, res) => {
  try {
    const { deliveryPersonId } = req.params;
    const { rejectionReason } = req.body;

    const deliveryPerson = await DeliveryPerson.findOne({
      _id: deliveryPersonId,
      deliveryType: 'RMA',
    });

    if (!deliveryPerson) {
      return res.status(404).json({
        message: 'RMA delivery partner not found',
      });
    }

    deliveryPerson.isActive = false;
    deliveryPerson.applicationStatus = 'REJECTED';
    deliveryPerson.rejectionReason =
      rejectionReason?.trim() || 'Application did not meet our criteria';
    deliveryPerson.reviewedAt = new Date();

    await deliveryPerson.save();

    return res.status(200).json({
      message: 'RMA delivery partner rejected successfully',
      deliveryPerson: {
        id: deliveryPerson._id,
        name: deliveryPerson.name,
        phone: deliveryPerson.phone,
        deliveryType: deliveryPerson.deliveryType,
        isActive: deliveryPerson.isActive,
        applicationStatus: deliveryPerson.applicationStatus,
        rejectionReason: deliveryPerson.rejectionReason,
        reviewedAt: deliveryPerson.reviewedAt,
      },
    });
  } catch (error) {
    console.error('RMA delivery partner rejection error:', error);

    return res.status(500).json({
      message: 'Server error',
    });
  }
};

module.exports = {
  getPendingDeliveryPartners,
  approveDeliveryPartner,
  rejectDeliveryPartner,
};
