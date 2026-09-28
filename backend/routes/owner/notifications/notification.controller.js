const Notification = require('../../../models/Notification');

// GET OWNER NOTIFICATIONS
async function getOwnerNotifications(req, res) {
  try {
    const notifications = await Notification.find({
      recipientType: 'owner',
      recipientId: req.owner._id,
    }).sort({ createdAt: -1 });

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
      message: 'Unable to fetch notifications',
    });
  }
}

// MARK ALL OWNER NOTIFICATIONS AS READ
async function markAllOwnerNotificationsAsRead(req, res) {
  try {
    await Notification.updateMany(
      {
        recipientType: 'owner',
        recipientId: req.owner._id,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
        },
      },
    );

    return res.status(200).json({
      message: 'All notifications marked as read',
    });
  } catch (error) {
    console.error('Mark all owner notifications as read failed:', error);

    return res.status(500).json({
      message: 'Unable to update notifications',
    });
  }
}

// MARK ONE OWNER NOTIFICATION AS READ
async function markOwnerNotificationAsRead(req, res) {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findOneAndUpdate(
      {
        _id: notificationId,
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
      message: 'Unable to update notifications',
    });
  }
}

module.exports = {
  getOwnerNotifications,
  markAllOwnerNotificationsAsRead,
  markOwnerNotificationAsRead,
};
