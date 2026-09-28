const Customer = require('../../../models/Customer');

// ==========================================
// GET CUSTOMER SAVED ADDRESSES
// ==========================================
const getCustomerAddresses = async (req, res) => {
  try {
    const customer = await Customer.findById(req.customer._id).select(
      'addresses',
    );

    if (!customer) {
      return res.status(404).json({
        message: 'Customer account not found',
      });
    }

    return res.status(200).json({
      addresses: customer.addresses || [],
    });
  } catch (error) {
    console.error('Get customer addresses failed:', error);

    return res.status(500).json({
      message: 'Unable to fetch saved addresses',
    });
  }
};

// ==========================================
// ADD CUSTOMER SAVED ADDRESS
// ==========================================
const addCustomerAddress = async (req, res) => {
  try {
    const { label, address, latitude, longitude } = req.body;

    if (!address || !address.trim()) {
      return res.status(400).json({
        message: 'Address is required',
      });
    }

    const customer = await Customer.findById(req.customer._id);

    if (!customer) {
      return res.status(404).json({
        message: 'Customer account not found',
      });
    }

    if (!customer.isActive) {
      return res.status(403).json({
        message: 'Customer account is inactive',
      });
    }

    const normalizedLabel = ['Home', 'Work', 'Other'].includes(label)
      ? label
      : 'Home';

    const hasAddresses = customer.addresses.length > 0;

    const newAddress = {
      label: normalizedLabel,
      address: address.trim(),
      latitude: typeof latitude === 'number' ? latitude : null,
      longitude: typeof longitude === 'number' ? longitude : null,
      isDefault: !hasAddresses,
    };

    customer.addresses.push(newAddress);

    await customer.save();

    const savedAddress = customer.addresses[customer.addresses.length - 1];

    return res.status(201).json({
      message: 'Address saved successfully',
      address: savedAddress,
    });
  } catch (error) {
    console.error('Add customer address failed:', error);

    return res.status(500).json({
      message: 'Unable to save address',
    });
  }
};

// ==========================================
// UPDATE CUSTOMER SAVED ADDRESS
// ==========================================
const updateCustomerAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const { label, address, latitude, longitude } = req.body;

    if (!address || !address.trim()) {
      return res.status(400).json({
        message: 'Address is required',
      });
    }

    const customer = await Customer.findById(req.customer._id);

    if (!customer) {
      return res.status(404).json({
        message: 'Customer account not found',
      });
    }

    if (!customer.isActive) {
      return res.status(403).json({
        message: 'Customer account is inactive',
      });
    }

    const savedAddress = customer.addresses.id(addressId);

    if (!savedAddress) {
      return res.status(404).json({
        message: 'Address not found',
      });
    }

    if (label && ['Home', 'Work', 'Other'].includes(label)) {
      savedAddress.label = label;
    }

    savedAddress.address = address.trim();

    savedAddress.latitude = typeof latitude === 'number' ? latitude : null;

    savedAddress.longitude = typeof longitude === 'number' ? longitude : null;

    await customer.save();

    return res.status(200).json({
      message: 'Address updated successfully',
      address: savedAddress,
    });
  } catch (error) {
    console.error('Update customer address failed:', error);

    return res.status(500).json({
      message: 'Unable to update address',
    });
  }
};

// ==========================================
// DELETE CUSTOMER SAVED ADDRESS
// ==========================================
const deleteCustomerAddress = async (req, res) => {
  try {
    const { addressId } = req.params;

    const customer = await Customer.findById(req.customer._id);

    if (!customer) {
      return res.status(404).json({
        message: 'Customer account not found',
      });
    }

    if (!customer.isActive) {
      return res.status(403).json({
        message: 'Customer account is inactive',
      });
    }

    const savedAddress = customer.addresses.id(addressId);

    if (!savedAddress) {
      return res.status(404).json({
        message: 'Address not found',
      });
    }

    const wasDefault = savedAddress.isDefault;

    savedAddress.deleteOne();

    // If the deleted address was the default,
    // make the first remaining address default.
    if (wasDefault && customer.addresses.length > 0) {
      customer.addresses[0].isDefault = true;
    }

    await customer.save();

    return res.status(200).json({
      message: 'Address deleted successfully',
      addresses: customer.addresses,
    });
  } catch (error) {
    console.error('Delete customer address failed:', error);

    return res.status(500).json({
      message: 'Unable to delete address',
    });
  }
};

// ==========================================
// SET DEFAULT CUSTOMER ADDRESS
// ==========================================
const setDefaultCustomerAddress = async (req, res) => {
  try {
    const { addressId } = req.params;

    const customer = await Customer.findById(req.customer._id);

    if (!customer) {
      return res.status(404).json({
        message: 'Customer account not found',
      });
    }

    if (!customer.isActive) {
      return res.status(403).json({
        message: 'Customer account is inactive',
      });
    }

    const selectedAddress = customer.addresses.id(addressId);

    if (!selectedAddress) {
      return res.status(404).json({
        message: 'Address not found',
      });
    }

    customer.addresses.forEach((savedAddress) => {
      savedAddress.isDefault = savedAddress._id.toString() === addressId;
    });

    await customer.save();

    return res.status(200).json({
      message: 'Default address updated successfully',
      addresses: customer.addresses,
    });
  } catch (error) {
    console.error('Set default customer address failed:', error);

    return res.status(500).json({
      message: 'Unable to set default address',
    });
  }
};

module.exports = {
  getCustomerAddresses,
  addCustomerAddress,
  updateCustomerAddress,
  deleteCustomerAddress,
  setDefaultCustomerAddress,
};
