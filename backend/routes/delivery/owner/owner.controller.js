const DeliveryPerson = require('../../../models/DeliveryPerson');

// ==========================================
// GET DELIVERY PERSON
// FOR LOGGED-IN OWNER
// ==========================================
const getDeliveryPerson = async (req, res) => {
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
};

// ==========================================
// ACTIVATE / DEACTIVATE DELIVERY PERSON
// ==========================================
const updateDeliveryPersonStatus = async (req, res) => {
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
};

// ==========================================
// UPDATE DELIVERY PERSON DETAILS
// ==========================================
const updateDeliveryPerson = async (req, res) => {
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
};

module.exports = {
  getDeliveryPerson,
  updateDeliveryPersonStatus,
  updateDeliveryPerson,
};
