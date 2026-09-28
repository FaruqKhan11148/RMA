const Customer = require('../../../models/Customer');

// ===============================
// UPDATE CUSTOMER PROFILE
// ===============================
const updateCustomerProfile = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: 'Name is required',
      });
    }

    const trimmedName = name.trim();

    if (trimmedName.length < 2) {
      return res.status(400).json({
        message: 'Name must be at least 2 characters',
      });
    }

    if (trimmedName.length > 80) {
      return res.status(400).json({
        message: 'Name cannot exceed 80 characters',
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

    customer.name = trimmedName;

    await customer.save();

    return res.status(200).json({
      message: 'Profile updated successfully',
      customer: {
        id: customer._id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
      },
    });
  } catch (error) {
    console.error('Update customer profile failed:', error);

    return res.status(500).json({
      message: 'Unable to update customer profile',
    });
  }
};

module.exports = {
  updateCustomerProfile,
};
