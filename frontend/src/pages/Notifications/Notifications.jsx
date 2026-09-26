import { useEffect, useState } from 'react';
import './Notifications.css';

import NotificationsHeader from './components/NotificationsHeader';
import NotificationsList from './components/NotificationsList';
import NotificationModal from './components/NotificationModal';

import { getNotificationStatus, formatDate } from './utils/notificationHelpers';
import {
  fetchNotifications as fetchNotificationsApi,
  markNotificationAsRead as markNotificationAsReadApi,
} from './utils/notificationApi';

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedNotification, setSelectedNotification] = useState(null);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const data = await fetchNotificationsApi();

        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      } catch (fetchError) {
        console.error('Fetch notifications failed:', fetchError);

        setError(fetchError.message || 'Unable to load messages');
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

  const handleNotificationClick = async (notification) => {
    setSelectedNotification(notification);

    if (notification.isRead) {
      return;
    }

    try {
      const success = await markNotificationAsReadApi(notification._id);

      if (!success) {
        return;
      }

      setNotifications((currentNotifications) =>
        currentNotifications.map((item) =>
          item._id === notification._id ? { ...item, isRead: true } : item,
        ),
      );

      setUnreadCount((currentCount) => Math.max(currentCount - 1, 0));
    } catch (error) {
      console.error('Mark notification as read failed:', error);
    }
  };

  return (
    <main className="notifications">
      <NotificationsHeader unreadCount={unreadCount} />

      <NotificationsList
        loading={loading}
        error={error}
        notifications={notifications}
        handleNotificationClick={handleNotificationClick}
        formatDate={formatDate}
      />

      <NotificationModal
        selectedNotification={selectedNotification}
        setSelectedNotification={setSelectedNotification}
        getNotificationStatus={getNotificationStatus}
        formatDate={formatDate}
      />
    </main>
  );
}

export default Notifications;
