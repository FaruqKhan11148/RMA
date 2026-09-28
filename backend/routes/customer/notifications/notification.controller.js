const Notification = require('../../../models/Notification');
const Customer = require('../../../models/Customer');

const {
  sendPushNotification,
} = require('../../../services/notificationService');

// ==========================================
// GET CUSTOMER NOTIFICATIONS
// ==========================================
const getCustomerNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipientType: 'customer',
      recipientId: req.customer._id,
    }).sort({ createdAt: -1 });

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
      message: 'Unable to fetch notifications',
    });
  }
};

// ==========================================
// MARK ALL CUSTOMER NOTIFICATIONS AS READ
// ==========================================
const markAllCustomerNotificationsAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      {
        recipientType: 'customer',
        recipientId: req.customer._id,
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
    console.error('Mark all customer notifications as read failed:', error);

    return res.status(500).json({
      message: 'Unable to update notifications',
    });
  }
};

// ==========================================
// MARK CUSTOMER NOTIFICATION AS READ
// ==========================================
const markCustomerNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findOneAndUpdate(
      {
        _id: notificationId,
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
      message: 'Unable to update notification',
    });
  }
};

// ==========================================
// TEST CUSTOMER PUSH NOTIFICATION
// ==========================================
const testCustomerNotification = async (req, res) => {
  try {
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

    if (!customer.fcmTokens || customer.fcmTokens.length === 0) {
      return res.status(400).json({
        message: 'No FCM tokens found for this customer',
      });
    }

    const response = await sendPushNotification({
      tokens: customer.fcmTokens,
      title: 'RMA Test Notification',
      body: 'Your RMA notification system is working!',
      data: {
        type: 'TEST_NOTIFICATION',
      },
    });

    if (response.invalidTokens.length > 0) {
      customer.fcmTokens = customer.fcmTokens.filter(
        (token) => !response.invalidTokens.includes(token),
      );

      await customer.save();
    }

    return res.status(200).json({
      message: 'Test notification sent',
      successCount: response.successCount,
      failureCount: response.failureCount,
    });
  } catch (error) {
    console.error('Test notification failed:', error);

    return res.status(500).json({
      message: 'Failed to send test notification',
    });
  }
};

// ==========================================
// SAVE CUSTOMER FCM TOKEN
// ==========================================
const saveCustomerNotificationToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token || typeof token !== 'string' || !token.trim()) {
      return res.status(400).json({
        message: 'FCM token is required',
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

    const trimmedToken = token.trim();

    await Customer.findByIdAndUpdate(customer._id, {
      $addToSet: {
        fcmTokens: trimmedToken,
      },
    });

    return res.status(200).json({
      message: 'Notification token saved successfully',
    });
  } catch (error) {
    console.error('Save customer FCM token failed:', error);

    return res.status(500).json({
      message: 'Unable to save notification token',
    });
  }
};

module.exports = {
  getCustomerNotifications,
  markAllCustomerNotificationsAsRead,
  markCustomerNotificationAsRead,
  testCustomerNotification,
  saveCustomerNotificationToken,
};
