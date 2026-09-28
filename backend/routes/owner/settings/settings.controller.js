const bcrypt = require('bcryptjs');

const Owner = require('../../../models/Owner');

// UPDATE PHONE
async function updateOwnerPhone(req, res) {
  try {
    const { phone } = req.body;

    if (!phone || !phone.trim()) {
      return res.status(400).json({
        message: 'Phone number is required',
      });
    }

    const normalizedPhone = phone.trim();

    if (normalizedPhone === req.owner.phone) {
      return res.status(400).json({
        message: 'This is already your current phone number',
      });
    }

    const existingOwner = await Owner.findOne({
      phone: normalizedPhone,
      _id: { $ne: req.owner._id },
    });

    if (existingOwner) {
      return res.status(409).json({
        message: 'This phone number is already registered with another owner',
      });
    }

    const updatedOwner = await Owner.findByIdAndUpdate(
      req.owner._id,
      {
        phone: normalizedPhone,
      },
      {
        new: true,
        runValidators: true,
      },
    ).select('-password');

    if (!updatedOwner) {
      return res.status(404).json({
        message: 'Owner account not found',
      });
    }

    res.status(200).json({
      message: 'Phone number updated successfully',
      owner: {
        id: updatedOwner._id,
        shopId: updatedOwner.shopId,
        ownerName: updatedOwner.ownerName,
        phone: updatedOwner.phone,
        email: updatedOwner.email,
        shopName: updatedOwner.shopName,
      },
    });
  } catch (error) {
    console.error('Update phone number failed:', error.message);

    res.status(500).json({
      message: 'Server error',
    });
  }
}

// UPDATE EMAIL
async function updateOwnerEmail(req, res) {
  try {
    const email = req.body.email?.trim().toLowerCase();

    if (!email) {
      return res.status(400).json({
        message: 'Email is required',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: 'Please enter a valid email address',
      });
    }

    if (email === req.owner.email) {
      return res.status(400).json({
        message: 'This is already your current email address',
      });
    }

    const existingOwner = await Owner.findOne({
      email,
      _id: { $ne: req.owner._id },
    });

    if (existingOwner) {
      return res.status(409).json({
        message: 'This email address is already registered',
      });
    }

    const updatedOwner = await Owner.findByIdAndUpdate(
      req.owner._id,
      {
        email,
      },
      {
        new: true,
        runValidators: true,
      },
    ).select('-password');

    return res.status(200).json({
      message: 'Email updated successfully',
      owner: {
        id: updatedOwner._id,
        shopId: updatedOwner.shopId,
        ownerName: updatedOwner.ownerName,
        phone: updatedOwner.phone,
        email: updatedOwner.email,
        shopName: updatedOwner.shopName,
      },
    });
  } catch (error) {
    console.error('Update owner email failed:', error);

    return res.status(500).json({
      message: 'Failed to update email',
    });
  }
}

// UPDATE OWNER NAME
async function updateOwnerName(req, res) {
  try {
    const ownerName = req.body.ownerName?.trim();

    if (!ownerName) {
      return res.status(400).json({
        message: 'Owner name is required',
      });
    }

    if (ownerName.length < 2) {
      return res.status(400).json({
        message: 'Owner name must be at least 2 characters long',
      });
    }

    if (ownerName === req.owner.ownerName) {
      return res.status(400).json({
        message: 'This is already your current owner name',
      });
    }

    const updatedOwner = await Owner.findByIdAndUpdate(
      req.owner._id,
      {
        ownerName,
      },
      {
        new: true,
        runValidators: true,
      },
    ).select('-password');

    if (!updatedOwner) {
      return res.status(404).json({
        message: 'Owner account not found',
      });
    }

    return res.status(200).json({
      message: 'Owner name updated successfully',
      owner: {
        id: updatedOwner._id,
        shopId: updatedOwner.shopId,
        ownerName: updatedOwner.ownerName,
        phone: updatedOwner.phone,
        email: updatedOwner.email,
        shopName: updatedOwner.shopName,
      },
    });
  } catch (error) {
    console.error('Update owner name failed:', error);

    return res.status(500).json({
      message: 'Failed to update owner name',
    });
  }
}

// UPDATE PASSWORD
async function updateOwnerPassword(req, res) {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: 'All password fields are required',
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: 'New passwords do not match',
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: 'New password must be at least 8 characters long',
      });
    }

    const owner = await Owner.findById(req.owner._id);

    if (!owner) {
      return res.status(404).json({
        message: 'Owner account not found',
      });
    }

    const passwordMatches = await bcrypt.compare(
      currentPassword,
      owner.password,
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: 'Current password is incorrect',
      });
    }

    const samePassword = await bcrypt.compare(newPassword, owner.password);

    if (samePassword) {
      return res.status(400).json({
        message: 'New password must be different from your current password',
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    owner.password = hashedPassword;

    await owner.save();

    return res.status(200).json({
      message: 'Password updated successfully',
    });
  } catch (error) {
    console.error('Update owner password failed:', error);

    return res.status(500).json({
      message: 'Failed to update password',
    });
  }
}

// UPDATE SHOP NAME
async function updateShopName(req, res) {
  try {
    const shopName = req.body.shopName?.trim();

    if (!shopName) {
      return res.status(400).json({
        message: 'Shop name is required',
      });
    }

    if (shopName.length < 2) {
      return res.status(400).json({
        message: 'Shop name must be at least 2 characters long',
      });
    }

    if (shopName === req.owner.shopName) {
      return res.status(400).json({
        message: 'This is already your current shop name',
      });
    }

    const updatedOwner = await Owner.findByIdAndUpdate(
      req.owner._id,
      {
        shopName,
      },
      {
        new: true,
        runValidators: true,
      },
    ).select('-password');

    if (!updatedOwner) {
      return res.status(404).json({
        message: 'Owner account not found',
      });
    }

    return res.status(200).json({
      message: 'Shop name updated successfully',
      owner: {
        id: updatedOwner._id,
        shopId: updatedOwner.shopId,
        ownerName: updatedOwner.ownerName,
        phone: updatedOwner.phone,
        email: updatedOwner.email,
        shopName: updatedOwner.shopName,
      },
    });
  } catch (error) {
    console.error('Update shop name failed:', error);

    return res.status(500).json({
      message: 'Failed to update shop name',
    });
  }
}

// UPDATE SHOP DESCRIPTION
async function updateShopDescription(req, res) {
  try {
    const description = req.body.description?.trim() || '';

    if (description.length > 500) {
      return res.status(400).json({
        message: 'Description cannot exceed 500 characters',
      });
    }

    if (description === req.owner.description) {
      return res.status(400).json({
        message: 'This is already your current shop description',
      });
    }

    const updatedOwner = await Owner.findByIdAndUpdate(
      req.owner._id,
      {
        description,
      },
      {
        new: true,
        runValidators: true,
      },
    ).select('-password');

    if (!updatedOwner) {
      return res.status(404).json({
        message: 'Owner account not found',
      });
    }

    return res.status(200).json({
      message: 'Shop description updated successfully',
      owner: {
        id: updatedOwner._id,
        shopId: updatedOwner.shopId,
        ownerName: updatedOwner.ownerName,
        phone: updatedOwner.phone,
        email: updatedOwner.email,
        shopName: updatedOwner.shopName,
        description: updatedOwner.description,
      },
    });
  } catch (error) {
    console.error('Update shop description failed:', error);

    return res.status(500).json({
      message: 'Failed to update shop description',
    });
  }
}

// UPDATE SHOP ADDRESS
async function updateShopAddress(req, res) {
  try {
    const address = req.body.address?.trim();

    if (!address) {
      return res.status(400).json({
        message: 'Shop address is required',
      });
    }

    if (address.length < 5) {
      return res.status(400).json({
        message: 'Shop address must be at least 5 characters long',
      });
    }

    if (address.length > 500) {
      return res.status(400).json({
        message: 'Shop address cannot exceed 500 characters',
      });
    }

    if (address === req.owner.address) {
      return res.status(400).json({
        message: 'This is already your current shop address',
      });
    }

    const updatedOwner = await Owner.findByIdAndUpdate(
      req.owner._id,
      {
        address,
      },
      {
        new: true,
        runValidators: true,
      },
    ).select('-password');

    if (!updatedOwner) {
      return res.status(404).json({
        message: 'Owner account not found',
      });
    }

    return res.status(200).json({
      message: 'Shop address updated successfully',
      owner: {
        id: updatedOwner._id,
        shopId: updatedOwner.shopId,
        ownerName: updatedOwner.ownerName,
        phone: updatedOwner.phone,
        email: updatedOwner.email,
        shopName: updatedOwner.shopName,
        description: updatedOwner.description,
        address: updatedOwner.address,
      },
    });
  } catch (error) {
    console.error('Update shop address failed:', error);

    return res.status(500).json({
      message: 'Failed to update shop address',
    });
  }
}

// UPDATE SHOP LOCATION
async function updateShopLocation(req, res) {
  try {
    const latitude = Number(req.body.latitude);
    const longitude = Number(req.body.longitude);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return res.status(400).json({
        message: 'Valid latitude and longitude are required',
      });
    }

    if (latitude < -90 || latitude > 90) {
      return res.status(400).json({
        message: 'Latitude must be between -90 and 90',
      });
    }

    if (longitude < -180 || longitude > 180) {
      return res.status(400).json({
        message: 'Longitude must be between -180 and 180',
      });
    }

    if (
      req.owner.location?.latitude === latitude &&
      req.owner.location?.longitude === longitude
    ) {
      return res.status(400).json({
        message: 'These are already your current shop coordinates',
      });
    }

    const updatedOwner = await Owner.findByIdAndUpdate(
      req.owner._id,
      {
        location: {
          latitude,
          longitude,
        },
      },
      {
        new: true,
        runValidators: true,
      },
    ).select('-password');

    if (!updatedOwner) {
      return res.status(404).json({
        message: 'Owner account not found',
      });
    }

    return res.status(200).json({
      message: 'Shop location updated successfully',
      owner: {
        id: updatedOwner._id,
        shopId: updatedOwner.shopId,
        ownerName: updatedOwner.ownerName,
        phone: updatedOwner.phone,
        email: updatedOwner.email,
        shopName: updatedOwner.shopName,
        description: updatedOwner.description,
        address: updatedOwner.address,
        location: updatedOwner.location,
      },
    });
  } catch (error) {
    console.error('Update shop location failed:', error);

    return res.status(500).json({
      message: 'Failed to update shop location',
    });
  }
}

// UPDATE SHOP OPEN/CLOSED STATUS
async function updateShopOpenClosed(req, res) {
  try {
    const { isOpen } = req.body;

    if (typeof isOpen !== 'boolean') {
      return res.status(400).json({
        message: 'isOpen must be a boolean',
      });
    }

    const updatedOwner = await Owner.findByIdAndUpdate(
      req.owner._id,
      {
        $set: {
          isOpen,
          statusOverride: isOpen ? 'open' : 'closed',
          statusOverrideAt: new Date(),
        },
      },
      {
        new: true,
        runValidators: true,
      },
    ).select('-password');

    if (!updatedOwner) {
      return res.status(404).json({
        message: 'Owner not found',
      });
    }

    return res.status(200).json({
      message: `Shop is now ${updatedOwner.isOpen ? 'open' : 'closed'}`,
      owner: {
        id: updatedOwner._id,
        shopId: updatedOwner.shopId,
        ownerName: updatedOwner.ownerName,
        phone: updatedOwner.phone,
        email: updatedOwner.email,
        shopName: updatedOwner.shopName,
        isOpen: updatedOwner.isOpen,
        statusOverride: updatedOwner.statusOverride,
        statusOverrideAt: updatedOwner.statusOverrideAt,
        deliverySettings: updatedOwner.deliverySettings,
      },
    });
  } catch (error) {
    console.error('Error updating shop status:', error);

    return res.status(500).json({
      message: 'Failed to update shop status',
    });
  }
}

// UPDATE DELIVERY AVAILABILITY
async function updateDeliveryAvailability(req, res) {
  try {
    const { delivery } = req.body;

    if (typeof delivery !== 'boolean') {
      return res.status(400).json({
        message: 'Delivery status must be true or false',
      });
    }

    if (req.owner.delivery === delivery) {
      return res.status(400).json({
        message: `Delivery is already ${
          delivery ? 'available' : 'unavailable'
        }`,
      });
    }

    const updatedOwner = await Owner.findByIdAndUpdate(
      req.owner._id,
      { delivery },
      { new: true, runValidators: true },
    ).select('-password');

    if (!updatedOwner) {
      return res.status(404).json({
        message: 'Owner account not found',
      });
    }

    return res.status(200).json({
      message: `Delivery is now ${
        updatedOwner.delivery ? 'available' : 'unavailable'
      }`,
      owner: {
        id: updatedOwner._id,
        shopId: updatedOwner.shopId,
        ownerName: updatedOwner.ownerName,
        phone: updatedOwner.phone,
        email: updatedOwner.email,
        shopName: updatedOwner.shopName,
        delivery: updatedOwner.delivery,
      },
    });
  } catch (error) {
    console.error('Update delivery availability failed:', error);

    return res.status(500).json({
      message: 'Failed to update delivery availability',
    });
  }
}

// UPDATE PICKUP AVAILABILITY
async function updatePickupAvailability(req, res) {
  try {
    const { pickup } = req.body;

    if (typeof pickup !== 'boolean') {
      return res.status(400).json({
        message: 'Pickup status must be true or false',
      });
    }

    if (req.owner.pickup === pickup) {
      return res.status(400).json({
        message: `Pickup is already ${pickup ? 'available' : 'unavailable'}`,
      });
    }

    const updatedOwner = await Owner.findByIdAndUpdate(
      req.owner._id,
      { pickup },
      { new: true, runValidators: true },
    ).select('-password');

    if (!updatedOwner) {
      return res.status(404).json({
        message: 'Owner account not found',
      });
    }

    return res.status(200).json({
      message: `Pickup is now ${
        updatedOwner.pickup ? 'available' : 'unavailable'
      }`,
      owner: {
        id: updatedOwner._id,
        shopId: updatedOwner.shopId,
        ownerName: updatedOwner.ownerName,
        phone: updatedOwner.phone,
        email: updatedOwner.email,
        shopName: updatedOwner.shopName,
        pickup: updatedOwner.pickup,
      },
    });
  } catch (error) {
    console.error('Update pickup availability failed:', error);

    return res.status(500).json({
      message: 'Failed to update pickup availability',
    });
  }
}

// UPDATE DELIVERY SETTINGS
async function updateDeliverySettings(req, res) {
  try {
    const {
      deliveryRadius,
      minimumOrderAmount,
      deliveryCharge,
      freeDeliveryAbove,
      estimatedDeliveryTime,
      openingTime,
      closingTime,
      shopStatusMode,
    } = req.body;

    const radius = Number(deliveryRadius);
    const minimumOrder = Number(minimumOrderAmount);
    const charge = Number(deliveryCharge);
    const freeAbove = Number(freeDeliveryAbove);
    const estimatedTime = Number(estimatedDeliveryTime);

    const timeRegex = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

    if (!timeRegex.test(openingTime)) {
      return res.status(400).json({
        message: 'Opening time must be in HH:mm format',
      });
    }

    if (!timeRegex.test(closingTime)) {
      return res.status(400).json({
        message: 'Closing time must be in HH:mm format',
      });
    }

    if (!['auto', 'open', 'closed'].includes(shopStatusMode)) {
      return res.status(400).json({
        message: 'Invalid shop status mode',
      });
    }

    if (!Number.isFinite(radius) || radius <= 0) {
      return res.status(400).json({
        message: 'Delivery radius must be greater than 0',
      });
    }

    if (!Number.isFinite(minimumOrder) || minimumOrder < 0) {
      return res.status(400).json({
        message: 'Minimum order amount cannot be negative',
      });
    }

    if (!Number.isFinite(charge) || charge < 0) {
      return res.status(400).json({
        message: 'Delivery charge cannot be negative',
      });
    }

    if (!Number.isFinite(freeAbove) || freeAbove < 0) {
      return res.status(400).json({
        message: 'Free delivery amount cannot be negative',
      });
    }

    if (!Number.isFinite(estimatedTime) || estimatedTime <= 0) {
      return res.status(400).json({
        message: 'Estimated delivery time must be greater than 0',
      });
    }

    const updatedOwner = await Owner.findByIdAndUpdate(
      req.owner._id,
      {
        $set: {
          'deliverySettings.deliveryRadius': radius,
          'deliverySettings.minimumOrderAmount': minimumOrder,
          'deliverySettings.deliveryCharge': charge,
          'deliverySettings.freeDeliveryAbove': freeAbove,
          'deliverySettings.estimatedDeliveryTime': estimatedTime,
          'deliverySettings.openingTime': openingTime,
          'deliverySettings.closingTime': closingTime,
          'deliverySettings.shopStatusMode': shopStatusMode,

          statusOverride: 'none',
          statusOverrideAt: null,
        },
      },
      {
        new: true,
        runValidators: true,
      },
    ).select('-password');

    if (!updatedOwner) {
      return res.status(404).json({
        message: 'Owner account not found',
      });
    }

    return res.status(200).json({
      message: 'Delivery settings updated successfully',
      owner: {
        id: updatedOwner._id,
        shopId: updatedOwner.shopId,
        ownerName: updatedOwner.ownerName,
        phone: updatedOwner.phone,
        email: updatedOwner.email,
        shopName: updatedOwner.shopName,
        delivery: updatedOwner.delivery,
        deliverySettings: updatedOwner.deliverySettings,
      },
    });
  } catch (error) {
    console.error('Update delivery settings failed:', error);

    return res.status(500).json({
      message: 'Failed to update delivery settings',
    });
  }
}

module.exports = {
  updateOwnerPhone,
  updateOwnerEmail,
  updateOwnerName,
  updateOwnerPassword,
  updateShopName,
  updateShopDescription,
  updateShopAddress,
  updateShopLocation,
  updateShopOpenClosed,
  updateDeliveryAvailability,
  updatePickupAvailability,
  updateDeliverySettings,
};
