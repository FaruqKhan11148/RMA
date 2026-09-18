const { getMessaging } = require('firebase-admin/messaging');

const Notification = require('../models/Notification');
const Customer = require('../models/Customer');
const Owner = require('../models/Owner');

require('../config/firebaseAdmin');

// ==========================================
// SEND PUSH NOTIFICATION
// ==========================================
const sendPushNotification = async ({ tokens, title, body, data = {} }) => {
  if (!tokens || tokens.length === 0) {
    return {
      successCount: 0,
      failureCount: 0,
      invalidTokens: [],
    };
  }

  const message = {
    data: {
      title,
      body,

      ...Object.fromEntries(
        Object.entries(data).map(([key, value]) => [key, String(value)]),
      ),
    },

    tokens,
  };

  const response = await getMessaging().sendEachForMulticast(message);

  const invalidTokens = [];

  response.responses.forEach((result, index) => {
    if (!result.success) {
      const errorCode = result.error?.code;

      if (
        errorCode === 'messaging/registration-token-not-registered' ||
        errorCode === 'messaging/invalid-registration-token'
      ) {
        invalidTokens.push(tokens[index]);
      }

      console.error(
        `FCM token failed (${index}):`,
        result.error?.code,
        result.error?.message,
      );
    }
  });

  console.log(
    `FCM notification sent: ${response.successCount} successful, ${response.failureCount} failed`,
  );

  return {
    ...response,
    invalidTokens,
  };
};

// ==========================================
// GET RECIPIENT FCM TOKENS
// ==========================================
const getRecipientTokens = async ({ recipientType, recipientId }) => {
  if (recipientType === 'customer') {
    const customer = await Customer.findById(recipientId).select('fcmTokens');

    return customer?.fcmTokens || [];
  }

  if (recipientType === 'owner') {
    const owner = await Owner.findById(recipientId).select('fcmTokens');

    return owner?.fcmTokens || [];
  }

  return [];
};

// ==========================================
// REMOVE INVALID FCM TOKENS
// ==========================================
const removeInvalidTokens = async ({
  recipientType,
  recipientId,
  invalidTokens,
}) => {
  if (!invalidTokens || invalidTokens.length === 0) {
    return;
  }

  if (recipientType === 'customer') {
    await Customer.findByIdAndUpdate(recipientId, {
      $pull: {
        fcmTokens: {
          $in: invalidTokens,
        },
      },
    });

    return;
  }

  if (recipientType === 'owner') {
    await Owner.findByIdAndUpdate(recipientId, {
      $pull: {
        fcmTokens: {
          $in: invalidTokens,
        },
      },
    });
  }
};

// ==========================================
// CREATE NOTIFICATION + SEND PUSH
// ==========================================
const createAndSendNotification = async ({
  recipientType,
  recipientId,
  type,
  title,
  message,
  orderId = null,
  data = {},
}) => {
  // ----------------------------------------
  // 1. SAVE NOTIFICATION TO MONGODB
  // ----------------------------------------
  const notification = await Notification.create({
    recipientType,
    recipientId,
    type,
    title,
    message,
    orderId,
    isRead: false,
    data,
  });

  // ----------------------------------------
  // 2. GET FCM TOKENS
  // ----------------------------------------
  const tokens = await getRecipientTokens({
    recipientType,
    recipientId,
  });

  // ----------------------------------------
  // 3. SEND PUSH NOTIFICATION
  // ----------------------------------------
  if (tokens.length === 0) {
    console.log(`No FCM tokens found for ${recipientType}: ${recipientId}`);

    return notification;
  }

  const response = await sendPushNotification({
    tokens,
    title,
    body: message,
    data: {
      type,
      notificationId: notification._id,
      orderId: orderId || '',
      ...data,
    },
  });

  // ----------------------------------------
  // 4. REMOVE INVALID TOKENS
  // ----------------------------------------
  if (response.invalidTokens.length > 0) {
    await removeInvalidTokens({
      recipientType,
      recipientId,
      invalidTokens: response.invalidTokens,
    });
  }

  return notification;
};

module.exports = {
  sendPushNotification,
  createAndSendNotification,
};
