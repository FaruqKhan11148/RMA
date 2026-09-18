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

messaging.onBackgroundMessage((payload) => {
  console.log('[RMA SERVICE WORKER] Background message received:', payload);

  const notificationTitle = payload.data?.title || 'RMA Notification';

  const notificationOptions = {
    body: payload.data?.body || 'You have a new notification from RMA.',
    icon: '/rma-notification-icon.png',
    data: payload.data || {},
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
