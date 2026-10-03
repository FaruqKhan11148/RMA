const DeliveryPerson = require('../../../models/DeliveryPerson');
const Order = require('../../../models/Order');

// ============================================================
// GET ALL DELIVERY PERSONS
// ============================================================
const getAllDeliveryPersons = async (req, res) => {
  try {
    const deliveryPersons = await DeliveryPerson.find({
      deliveryType: 'RMA',
    })
      .select(
        [
          'name',
          'phone',
          'deliveryType',
          'applicationStatus',
          'isActive',
          'availabilityStatus',
          'currentLocation',
          'createdAt',
          'updatedAt',
        ].join(' '),
      )
      .sort({ createdAt: -1 });

    const deliveryData = await Promise.all(
      deliveryPersons.map(async (deliveryPerson) => {
        const person = deliveryPerson.toObject();

        // Currently active deliveries assigned to this RMA partner
        const activeOrders = await Order.countDocuments({
          deliveryPersonId: deliveryPerson._id,
          orderType: 'delivery',
          status: 'OutForDelivery',
          deliveryAssignmentStatus: 'ACCEPTED',
        });

        // Completed deliveries assigned to this RMA partner
        const completedOrders = await Order.countDocuments({
          deliveryPersonId: deliveryPerson._id,
          orderType: 'delivery',
          status: 'Completed',
          otpVerified: true,
        });

        // Total delivery orders assigned to this RMA partner
        const totalDeliveryOrders = await Order.countDocuments({
          deliveryPersonId: deliveryPerson._id,
          orderType: 'delivery',
        });

        return {
          ...person,

          activeOrders,
          completedOrders,
          totalDeliveryOrders,
        };
      }),
    );

    return res.status(200).json({
      count: deliveryData.length,
      deliveryPersons: deliveryData,
    });
  } catch (error) {
    console.error('Admin RMA delivery partners fetch error:', error);

    return res.status(500).json({
      message: 'Failed to fetch RMA delivery partners',
    });
  }
};
// ============================================================
// GET SINGLE RMA DELIVERY PARTNER
// ============================================================

const getDeliveryPerson = async (req, res) => {
  try {
    const { deliveryPersonId } = req.params;

    const deliveryPerson = await DeliveryPerson.findOne({
      _id: deliveryPersonId,
      deliveryType: 'RMA',
    }).select(
      [
        'name',
        'phone',
        'deliveryType',
        'applicationStatus',
        'isActive',
        'availabilityStatus',
        'currentLocation',
        'createdAt',
        'updatedAt',
      ].join(' '),
    );

    if (!deliveryPerson) {
      return res.status(404).json({
        message: 'Delivery person not found',
      });
    }

    // Get orders actually assigned to this delivery partner
    const orders = await Order.find({
      deliveryPersonId: deliveryPerson._id,
      orderType: 'delivery',
    })
      .select(
        [
          'orderId',
          'customer',
          'totalPrice',
          'status',
          'paymentStatus',
          'paymentMethod',
          'deliveryCharge',
          'deliveryRiderAmount',
          'deliveryAssignmentStatus',
          'deliveryPickupStatus',
          'otpVerified',
          'deliveryOtpGeneratedAt',
          'createdAt',
          'acceptedAt',
          'preparingAt',
          'readyAt',
          'collectedAt',
          'outForDeliveryAt',
          'completedAt',
          'rejectedAt',
        ].join(' '),
      )
      .sort({ createdAt: -1 });

    const completedOrders = orders.filter(
      (order) => order.status === 'Completed' && order.otpVerified === true,
    ).length;

    const activeOrders = orders.filter(
      (order) => order.status === 'OutForDelivery',
    ).length;

    return res.status(200).json({
      deliveryPerson: {
        ...deliveryPerson.toObject(),

        activeOrders,
        completedOrders,
        totalDeliveryOrders: orders.length,

        orders,
      },
    });
  } catch (error) {
    console.error('Admin RMA delivery person fetch error:', error);

    return res.status(500).json({
      message: 'Failed to fetch delivery person',
    });
  }
};

module.exports = {
  getAllDeliveryPersons,
  getDeliveryPerson,
};
