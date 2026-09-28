const Order = require('../../../models/Order');

// ==========================================
// GET DELIVERY ORDERS
// FOR LOGGED-IN DELIVERY PERSON
// ==========================================
const getDeliveryOrders = async (req, res) => {
  try {
    const deliveryPerson = req.deliveryPerson;

    const orders = await Order.find({
      deliveryPersonId: deliveryPerson._id,
      status: 'OutForDelivery',
      orderType: 'delivery',
    })
      .populate('ownerId', 'ownerName shopName phone shopId location')
      .sort({ createdAt: -1 });

    res.status(200).json({
      orders,
    });
  } catch (error) {
    console.error('Get delivery orders failed:', error);

    res.status(500).json({
      message: 'Server error',
    });
  }
};

// ==========================================
// GET DELIVERY DASHBOARD SUMMARY
// ==========================================
const getDeliveryDashboard = async (req, res) => {
  try {
    const deliveryPerson = req.deliveryPerson;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const baseQuery = {
      deliveryPersonId: deliveryPerson._id,
      orderType: 'delivery',
    };

    // TODAY'S ORDERS
    const todayOrders = await Order.find({
      ...baseQuery,
      createdAt: {
        $gte: startOfToday,
        $lte: endOfToday,
      },
    })
      .populate('ownerId', 'ownerName shopName phone shopId location')
      .sort({ createdAt: -1 });

    // PENDING DELIVERIES
    const pendingOrders = todayOrders.filter(
      (order) => order.status === 'OutForDelivery',
    );

    // COMPLETED TODAY
    const completedTodayOrders = todayOrders.filter(
      (order) => order.status === 'Completed',
    );

    // ALL-TIME DELIVERED ORDERS
    const allDeliveredOrders = await Order.find({
      ...baseQuery,
      status: 'Completed',
    })
      .populate('ownerId', 'ownerName shopName phone shopId location')
      .sort({ completedAt: -1 });

    res.status(200).json({
      today: {
        orders: todayOrders.length,
        pending: pendingOrders.length,
        completed: completedTodayOrders.length,
      },

      allTime: {
        delivered: allDeliveredOrders.length,
      },

      orders: {
        today: todayOrders,
        pending: pendingOrders,
        completedToday: completedTodayOrders,
        allDelivered: allDeliveredOrders,
      },

      summary: {
        distance: null,
        earnings: null,
      },
    });
  } catch (error) {
    console.error('Get delivery dashboard failed:', error);

    res.status(500).json({
      message: 'Server error',
    });
  }
};

// ==========================================
// GET DELIVERY PARTNER EARNINGS
// ==========================================
const getDeliveryEarnings = async (req, res) => {
  try {
    const deliveryPerson = req.deliveryPerson;

    const now = new Date();

    // -------------------------------
    // START OF TODAY
    // -------------------------------
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    // -------------------------------
    // START OF THIS WEEK
    // Monday = first day of week
    // -------------------------------
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();

    const daysFromMonday = day === 0 ? 6 : day - 1;

    startOfWeek.setDate(startOfWeek.getDate() - daysFromMonday);

    startOfWeek.setHours(0, 0, 0, 0);

    // -------------------------------
    // COMPLETED ORDERS
    // -------------------------------
    const completedOrders = await Order.find({
      deliveryPersonId: deliveryPerson._id,
      orderType: 'delivery',
      status: 'Completed',
    })
      .select(
        'orderId deliveryRiderAmount deliveryCharge completedAt createdAt',
      )
      .sort({ completedAt: -1 });

    // -------------------------------
    // TOTAL EARNINGS
    // -------------------------------
    const totalEarnings = completedOrders.reduce(
      (total, order) => total + Number(order.deliveryRiderAmount || 0),
      0,
    );

    // -------------------------------
    // TODAY'S EARNINGS
    // -------------------------------
    const todayOrders = completedOrders.filter(
      (order) =>
        order.completedAt && new Date(order.completedAt) >= startOfToday,
    );

    const todayEarnings = todayOrders.reduce(
      (total, order) => total + Number(order.deliveryRiderAmount || 0),
      0,
    );

    // -------------------------------
    // THIS WEEK'S EARNINGS
    // -------------------------------
    const weekOrders = completedOrders.filter(
      (order) =>
        order.completedAt && new Date(order.completedAt) >= startOfWeek,
    );

    const weekEarnings = weekOrders.reduce(
      (total, order) => total + Number(order.deliveryRiderAmount || 0),
      0,
    );

    // -------------------------------
    // RECENT EARNINGS
    // -------------------------------
    const recentEarnings = completedOrders.slice(0, 20).map((order) => ({
      orderId: order.orderId,
      amount: Number(Number(order.deliveryRiderAmount || 0).toFixed(2)),
      deliveryCharge: Number(Number(order.deliveryCharge || 0).toFixed(2)),
      completedAt: order.completedAt,
    }));

    return res.status(200).json({
      totalEarnings: Number(totalEarnings.toFixed(2)),
      todayEarnings: Number(todayEarnings.toFixed(2)),
      weekEarnings: Number(weekEarnings.toFixed(2)),
      recentEarnings,
    });
  } catch (error) {
    console.error('Get delivery earnings failed:', error);

    return res.status(500).json({
      message: 'Server error',
    });
  }
};

module.exports = {
  getDeliveryOrders,
  getDeliveryDashboard,
  getDeliveryEarnings,
};
