import { getToken, onMessage } from 'firebase/messaging';
import { messagingPromise } from './firebase';

const VAPID_KEY = process.env.REACT_APP_FIREBASE_VAPID_KEY;

export const requestOwnerNotificationPermission = async (ownerAuthToken) => {
  try {
    if (!ownerAuthToken) {
      console.log('OWNER: Authentication token is missing.');
      return null;
    }

    if (!('Notification' in window)) {
      console.log('OWNER: This browser does not support notifications.');
      return null;
    }

    const permission = await Notification.requestPermission();

    if (permission !== 'granted') {
      console.log('OWNER: Notification permission was not granted.');
      return null;
    }

    const messaging = await messagingPromise;

    if (!messaging) {
      console.log(
        'OWNER: Firebase Messaging is not supported in this browser.',
      );
      return null;
    }

    const serviceWorkerRegistration = await navigator.serviceWorker.register(
      '/firebase-messaging-sw.js',
    );

    const ownerFcmToken = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration,
    });

    if (!ownerFcmToken) {
      console.log('OWNER: No FCM registration token available.');
      return null;
    }

    console.log('OWNER FCM TOKEN:', ownerFcmToken);

    const response = await fetch(
      `https://rma-backend-bo4a.onrender.com/api/owners/notification-token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ownerAuthToken}`,
        },
        body: JSON.stringify({
          token: ownerFcmToken,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(
        'OWNER: Failed to save OWNER FCM TOKEN:',
        data.message || 'Unknown error',
      );

      return ownerFcmToken;
    }

    console.log('OWNER FCM TOKEN SAVED TO RMA BACKEND.');

    return ownerFcmToken;
  } catch (error) {
    console.error('OWNER: FCM setup failed:', error);

    return null;
  }
};

export const listenForOwnerNotifications = async (onNotification) => {
  try {
    const messaging = await messagingPromise;

    if (!messaging) {
      console.log(
        'OWNER: Firebase Messaging is not supported in this browser.',
      );
      return null;
    }

    const handledMessageIds = new Set();

    const handleNotification = (payload) => {
      if (!payload) {
        return;
      }

      const messageId =
        payload?.messageId ||
        payload?.data?.messageId ||
        payload?.data?.notificationId;

      if (messageId && handledMessageIds.has(messageId)) {
        return;
      }

      if (messageId) {
        handledMessageIds.add(messageId);
      }

      console.log('OWNER FOREGROUND NOTIFICATION:', payload);

      if (onNotification) {
        onNotification(payload);
      }
    };

    // Firebase foreground messages
    const unsubscribeOnMessage = onMessage(messaging, (payload) => {
      handleNotification(payload);
    });

    // Service-worker messages
    const handleServiceWorkerMessage = (event) => {
      if (event?.data?.type !== 'RMA_FCM_NOTIFICATION') {
        return;
      }

      console.log('OWNER: MESSAGE RECEIVED FROM SERVICE WORKER:', event.data);

      handleNotification(event.data.payload);
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener(
        'message',
        handleServiceWorkerMessage,
      );
    }

    console.log('OWNER ONMESSAGE LISTENER REGISTERED.');

    return () => {
      unsubscribeOnMessage();

      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener(
          'message',
          handleServiceWorkerMessage,
        );
      }
    };
  } catch (error) {
    console.error('OWNER: Notification listener failed:', error);
    return null;
  }
};
