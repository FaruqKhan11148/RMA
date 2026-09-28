const Customer = require('../../../models/Customer');
const SupportIssue = require('../../../models/SupportIssue');

// ==========================================
// CREATE CUSTOMER SUPPORT ISSUE
// ==========================================
const createCustomerSupportIssue = async (req, res) => {
  try {
    const { issueType, orderId, description } = req.body;

    if (!issueType) {
      return res.status(400).json({
        message: 'Issue type is required',
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({
        message: 'Description is required',
      });
    }

    const validIssueTypes = [
      'order_not_received',
      'wrong_items',
      'missing_items',
      'damaged_items',
      'payment_problem',
      'delivery_problem',
      'shop_problem',
      'other',
    ];

    if (!validIssueTypes.includes(issueType)) {
      return res.status(400).json({
        message: 'Invalid issue type',
      });
    }

    const trimmedDescription = description.trim();

    if (trimmedDescription.length > 1000) {
      return res.status(400).json({
        message: 'Description cannot exceed 1000 characters',
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

    const supportIssue = await SupportIssue.create({
      customer: customer._id,
      issueType,
      orderId: orderId ? orderId.trim() : '',
      description: trimmedDescription,
    });

    return res.status(201).json({
      message: 'Issue reported successfully',
      issue: supportIssue,
    });
  } catch (error) {
    console.error('Create customer support issue failed:', error);

    return res.status(500).json({
      message: 'Unable to submit issue report',
    });
  }
};

module.exports = {
  createCustomerSupportIssue,
};
