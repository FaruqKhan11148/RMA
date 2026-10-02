importScripts(
  'https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js',
);

importScripts(
  'https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js',
);

firebase.initializeApp({
  apiKey: 'AIzaSyDZElVRBeFtkcpysKKVmgW7xTB0ZuG_bYA',
  authDomain: 'rma1-d5784.firebaseapp.com',
  projectId: 'rma1-d5784',
  storageBucket: 'rma1-d5784.firebasestorage.app',
  messagingSenderId: '436909446638',
  appId: '1:436909446638:web:0941783958ad726272eaff',
});

const messaging = firebase.messaging();

// ==========================================
// BACKGROUND FCM MESSAGE
// ==========================================

messaging.onBackgroundMessage((payload) => {
  console.log('[RMA SERVICE WORKER] Background message received:', payload);

  const notificationTitle = payload.data?.title || 'RMA Notification';

  const notificationOptions = {
    body: payload.data?.body || 'You have a new notification from RMA.',
    icon: '/rma-notification-icon.png',
    data: payload.data || {},
  };

  self.registration.showNotification(notificationTitle, notificationOptions);

  self.clients
    .matchAll({
      type: 'window',
      includeUncontrolled: true,
    })
    .then((clientList) => {
      console.log(
        '[RMA SERVICE WORKER] Open browser clients:',
        clientList.length,
      );

      clientList.forEach((client) => {
        console.log('[RMA SERVICE WORKER] Sending message to:', client.url);

        client.postMessage({
          type: 'RMA_FCM_NOTIFICATION',
          payload,
        });
      });
    })
    .catch((error) => {
      console.error('[RMA SERVICE WORKER] Failed to message clients:', error);
    });
});

// ==========================================
// NOTIFICATION CLICK
// ==========================================

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const data = event.notification.data || {};

  console.log('[RMA SW] Notification clicked:', data);

  const screen = data.screen;
  const orderId = data.orderId;

  let targetPath = '/';

  if (screen === 'owner-dashboard') {
    targetPath = '/owner/dashboard';
  } else if (screen === 'order-status' && orderId) {
    targetPath = `/delivery-status/${orderId}`;
  } else if (screen === 'delivery-orders') {
    targetPath = '/delivery/orders-delivery';
  }

  const targetUrl = new URL(targetPath, self.location.origin).href;

  console.log('[RMA SW] Opening:', targetUrl);

  event.waitUntil(
    clients
      .matchAll({
        type: 'window',
        includeUncontrolled: true,
      })
      .then(async (clientList) => {
        for (const client of clientList) {
          if (client.url.startsWith(self.location.origin)) {
            try {
              await client.navigate(targetUrl);
            } catch (error) {
              console.error('[RMA SW] Navigation failed:', error);
            }

            try {
              await client.focus();
            } catch (error) {
              console.warn('[RMA SW] Could not focus existing window:', error);
            }

            return;
          }
        }

        return clients.openWindow(targetUrl);
      }),
  );
});
