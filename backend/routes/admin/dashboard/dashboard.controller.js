const Owner = require('../../../models/Owner');
const Customer = require('../../../models/Customer');
const Order = require('../../../models/Order');

const getAdminDashboard = async (req, res) => {
  try {
    const [
      totalOwners,
      totalCustomers,
      totalOrders,

      pendingOrders,
      acceptedOrders,
      preparingOrders,
      readyOrders,
      outForDeliveryOrders,
      completedOrders,
      rejectedOrders,

      completedPaidOrders,
    ] = await Promise.all([
      Owner.countDocuments(),
      Customer.countDocuments(),
      Order.countDocuments(),

      Order.countDocuments({ status: 'Pending' }),
      Order.countDocuments({ status: 'Accepted' }),
      Order.countDocuments({ status: 'Preparing' }),
      Order.countDocuments({ status: 'Ready' }),
      Order.countDocuments({ status: 'OutForDelivery' }),
      Order.countDocuments({ status: 'Completed' }),
      Order.countDocuments({ status: 'Rejected' }),

      Order.find({
        status: 'Completed',
        paymentStatus: 'Paid',
      }).select('totalPrice'),
    ]);

    const totalRmaFees = completedPaidOrders.reduce((total, order) => {
      const orderAmount = Number(order.totalPrice || 0);

      const rmaFee = orderAmount * 0.01;

      return total + rmaFee;
    }, 0);

    return res.status(200).json({
      stats: {
        totalOwners,
        totalCustomers,
        totalOrders,

        totalRmaFees: Number(totalRmaFees.toFixed(2)),
      },

      orderStatus: {
        Pending: pendingOrders,
        Accepted: acceptedOrders,
        Preparing: preparingOrders,
        Ready: readyOrders,
        OutForDelivery: outForDeliveryOrders,
        Completed: completedOrders,
        Rejected: rejectedOrders,
      },
    });
  } catch (error) {
    console.error('Admin dashboard fetch error:', error);

    return res.status(500).json({
      message: 'Failed to fetch admin dashboard',
    });
  }
};

module.exports = {
  getAdminDashboard,
};
