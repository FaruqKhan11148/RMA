const DeliveryPerson = require('../../../models/DeliveryPerson');

// ==========================================
// SAVE DELIVERY FCM NOTIFICATION TOKEN
// ==========================================
const saveDeliveryNotificationToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        message: 'FCM token is required',
      });
    }

    const deliveryPerson = req.deliveryPerson;

    if (!deliveryPerson.fcmTokens.includes(token)) {
      deliveryPerson.fcmTokens.push(token);
      await deliveryPerson.save();
    }

    return res.status(200).json({
      message: 'Delivery notification token saved successfully',
    });
  } catch (error) {
    console.error('Save delivery notification token failed:', error);

    return res.status(500).json({
      message: 'Unable to save delivery notification token',
    });
  }
};

module.exports = {
  saveDeliveryNotificationToken,
};
