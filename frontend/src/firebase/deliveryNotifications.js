import { getToken, onMessage } from 'firebase/messaging';
import { messagingPromise } from './firebase';

const VAPID_KEY = process.env.REACT_APP_FIREBASE_VAPID_KEY;

const API_URL = 'https://rma-backend-bo4a.onrender.com/';

export const requestDeliveryNotificationPermission = async (deliveryToken) => {
  try {
    if (!deliveryToken) {
      console.log('DELIVERY: Authentication token is missing.');
      return null;
    }

    if (!('Notification' in window)) {
      console.log('DELIVERY: This browser does not support notifications.');
      return null;
    }

    const permission = await Notification.requestPermission();

    if (permission !== 'granted') {
      console.log('DELIVERY: Notification permission was not granted.');
      return null;
    }

    const messaging = await messagingPromise;

    if (!messaging) {
      console.log(
        'DELIVERY: Firebase Messaging is not supported in this browser.',
      );
      return null;
    }

    const serviceWorkerRegistration = await navigator.serviceWorker.register(
      '/firebase-messaging-sw.js',
    );

    const deliveryFcmToken = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration,
    });

    if (!deliveryFcmToken) {
      console.log('DELIVERY: No FCM registration token available.');
      return null;
    }

    console.log('DELIVERY FCM TOKEN:', deliveryFcmToken);

    const response = await fetch(`${API_URL}api/delivery/notification-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${deliveryToken}`,
      },
      body: JSON.stringify({
        token: deliveryFcmToken,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(
        'DELIVERY: Failed to save DELIVERY FCM TOKEN:',
        data.message || 'Unknown error',
      );

      return deliveryFcmToken;
    }

    console.log('DELIVERY FCM TOKEN SAVED TO RMA BACKEND.');

    return deliveryFcmToken;
  } catch (error) {
    console.error('DELIVERY: FCM setup failed:', error);

    return null;
  }
};

export const listenForDeliveryNotifications = async (onNotification) => {
  try {
    const messaging = await messagingPromise;

    if (!messaging) {
      console.log(
        'DELIVERY: Firebase Messaging is not supported in this browser.',
      );
      return null;
    }

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('DELIVERY FOREGROUND NOTIFICATION:', payload);

      if (onNotification) {
        onNotification(payload);
      }
    });

    console.log('DELIVERY ONMESSAGE LISTENER REGISTERED.');

    return unsubscribe;
  } catch (error) {
    console.error('DELIVERY: Notification listener failed:', error);

    return null;
  }
};
