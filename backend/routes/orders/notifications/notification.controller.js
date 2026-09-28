const Notification = require('../../../models/Notification');

// ==========================================
// GET CUSTOMER NOTIFICATIONS
// ==========================================

async function getCustomerNotifications(req, res) {
  try {
    const notifications = await Notification.find({
      recipientType: 'customer',
      recipientId: req.customer._id,
    })
      .sort({ createdAt: -1 })
      .limit(100);

    const unreadCount = await Notification.countDocuments({
      recipientType: 'customer',
      recipientId: req.customer._id,
      isRead: false,
    });

    return res.status(200).json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error('Get customer notifications failed:', error);

    return res.status(500).json({
      message: 'Unable to fetch customer notifications',
    });
  }
}

// ==========================================
// GET OWNER NOTIFICATIONS
// ==========================================

async function getOwnerNotifications(req, res) {
  try {
    const notifications = await Notification.find({
      recipientType: 'owner',
      recipientId: req.owner._id,
    })
      .sort({ createdAt: -1 })
      .limit(100);

    const unreadCount = await Notification.countDocuments({
      recipientType: 'owner',
      recipientId: req.owner._id,
      isRead: false,
    });

    return res.status(200).json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error('Get owner notifications failed:', error);

    return res.status(500).json({
      message: 'Unable to fetch owner notifications',
    });
  }
}

// ==========================================
// GET DELIVERY NOTIFICATIONS
// ==========================================

async function getDeliveryNotifications(req, res) {
  try {
    const notifications = await Notification.find({
      recipientType: 'delivery',
      recipientId: req.deliveryPerson._id,
    })
      .sort({ createdAt: -1 })
      .limit(100);

    const unreadCount = await Notification.countDocuments({
      recipientType: 'delivery',
      recipientId: req.deliveryPerson._id,
      isRead: false,
    });

    return res.status(200).json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error('Get delivery notifications failed:', error);

    return res.status(500).json({
      message: 'Unable to fetch delivery notifications',
    });
  }
}

// ==========================================
// MARK CUSTOMER NOTIFICATION AS READ
// ==========================================

async function markCustomerNotificationAsRead(req, res) {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.notificationId,
        recipientType: 'customer',
        recipientId: req.customer._id,
      },
      {
        $set: {
          isRead: true,
        },
      },
      {
        new: true,
      },
    );

    if (!notification) {
      return res.status(404).json({
        message: 'Notification not found',
      });
    }

    return res.status(200).json({
      message: 'Notification marked as read',
      notification,
    });
  } catch (error) {
    console.error('Mark customer notification as read failed:', error);

    return res.status(500).json({
      message: 'Unable to mark notification as read',
    });
  }
}

// ==========================================
// MARK OWNER NOTIFICATION AS READ
// ==========================================

async function markOwnerNotificationAsRead(req, res) {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.notificationId,
        recipientType: 'owner',
        recipientId: req.owner._id,
      },
      {
        $set: {
          isRead: true,
        },
      },
      {
        new: true,
      },
    );

    if (!notification) {
      return res.status(404).json({
        message: 'Notification not found',
      });
    }

    return res.status(200).json({
      message: 'Notification marked as read',
      notification,
    });
  } catch (error) {
    console.error('Mark owner notification as read failed:', error);

    return res.status(500).json({
      message: 'Unable to mark notification as read',
    });
  }
}

// ==========================================
// MARK DELIVERY NOTIFICATION AS READ
// ==========================================

async function markDeliveryNotificationAsRead(req, res) {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.notificationId,
        recipientType: 'delivery',
        recipientId: req.deliveryPerson._id,
      },
      {
        $set: {
          isRead: true,
        },
      },
      {
        new: true,
      },
    );

    if (!notification) {
      return res.status(404).json({
        message: 'Notification not found',
      });
    }

    return res.status(200).json({
      message: 'Notification marked as read',
      notification,
    });
  } catch (error) {
    console.error('Mark delivery notification as read failed:', error);

    return res.status(500).json({
      message: 'Unable to mark notification as read',
    });
  }
}

module.exports = {
  getCustomerNotifications,
  getOwnerNotifications,
  getDeliveryNotifications,
  markCustomerNotificationAsRead,
  markOwnerNotificationAsRead,
  markDeliveryNotificationAsRead,
};
