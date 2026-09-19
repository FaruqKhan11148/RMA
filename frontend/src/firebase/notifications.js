import { getToken, onMessage } from 'firebase/messaging';
import { messagingPromise } from './firebase';

const VAPID_KEY = process.env.REACT_APP_FIREBASE_VAPID_KEY;
const API_URL = 'https://rma-backend-bo4a.onrender.com/';

export const requestCustomerNotificationPermission = async () => {
  try {
    if (!('Notification' in window)) {
      console.log('CUSTOMER: This browser does not support notifications.');
      return null;
    }

    const permission = await Notification.requestPermission();

    if (permission !== 'granted') {
      console.log('CUSTOMER: Notification permission was not granted.');
      return null;
    }

    const messaging = await messagingPromise;

    if (!messaging) {
      console.log(
        'CUSTOMER: Firebase Messaging is not supported in this browser.',
      );
      return null;
    }

    const serviceWorkerRegistration = await navigator.serviceWorker.register(
      '/firebase-messaging-sw.js',
    );

    const customerFcmToken = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration,
    });

    if (!customerFcmToken) {
      console.log('CUSTOMER: No FCM registration token available.');
      return null;
    }

    console.log('CUSTOMER FCM TOKEN:', customerFcmToken);

    const response = await fetch(`${API_URL}api/customers/notification-token`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: customerFcmToken,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(
        'CUSTOMER: Failed to save CUSTOMER FCM TOKEN:',
        data.message || 'Unknown error',
      );

      return customerFcmToken;
    }

    console.log('CUSTOMER FCM TOKEN SAVED TO RMA BACKEND.');

    return customerFcmToken;
  } catch (error) {
    console.error('CUSTOMER: FCM setup failed:', error);

    return null;
  }
};

export const listenForCustomerNotifications = async (onNotification) => {
  try {
    const messaging = await messagingPromise;

    if (!messaging) {
      console.log(
        'CUSTOMER: Firebase Messaging is not supported in this browser.',
      );
      return null;
    }

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('CUSTOMER FOREGROUND NOTIFICATION:', payload);

      const title =
        payload.notification?.title ||
        payload.data?.title ||
        'RMA Notification';

      const message =
        payload.notification?.body ||
        payload.data?.body ||
        'You have a new notification.';

      if (Notification.permission === 'granted') {
        const notification = new Notification(title, {
          body: message,
          icon: '/rma-notification-icon.png',
          data: payload.data || {},
        });

        notification.onclick = () => {
          const screen = payload.data?.screen;
          const orderId = payload.data?.orderId;

          window.focus();

          if (screen === 'order-status' && orderId) {
            window.location.href = `/delivery-status/${orderId}`;
          }
        };
      }

      if (onNotification) {
        onNotification(payload);
      }
    });

    console.log('CUSTOMER ONMESSAGE LISTENER REGISTERED.');

    return unsubscribe;
  } catch (error) {
    console.error('CUSTOMER: Notification listener failed:', error);

    return null;
  }
};
