import { useEffect, useState } from 'react';
import { Bell, X } from 'lucide-react';
import './Notifications.css';

const API_URL = 'https://rma-backend-bo4a.onrender.com/';

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedNotification, setSelectedNotification] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(`${API_URL}api/customers/notifications`, {
          credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Unable to fetch notifications');
        }

        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      } catch (fetchError) {
        console.error('Fetch customer notifications failed:', fetchError);

        setError(fetchError.message || 'Unable to load messages');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handleNotificationClick = async (notification) => {
    setSelectedNotification(notification);

    if (!notification.isRead) {
      try {
        const response = await fetch(
          `${API_URL}api/customers/notifications/${notification._id}/read`,
          {
            method: 'PATCH',
            credentials: 'include',
          },
        );

        if (!response.ok) {
          console.error('Failed to mark notification as read');
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
    }
  };

  const getNotificationStatus = (type) => {
    const statusMap = {
      ORDER_ACCEPTED: 'Accepted',
      ORDER_PREPARING: 'Preparing',
      ORDER_READY: 'Ready',
      ORDER_OUT_FOR_DELIVERY: 'Out for Delivery',
      ORDER_COMPLETED: 'Completed',
      ORDER_REJECTED: 'Rejected',
      NEW_ORDER: 'New Order',
      DELIVERY_ASSIGNED: 'Delivery Assigned',
    };

    return statusMap[type] || 'Notification';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <main className="notifications">
      <section className="notifications_header">
        <div>
          <h1>Messages</h1>

          <p>Stay updated with your orders and RMA.</p>
        </div>

        {unreadCount > 0 && (
          <span className="notifications_unread_count">{unreadCount}</span>
        )}
      </section>

      <section className="notifications_list">
        {loading && (
          <div className="notification_state">
            <p>Loading messages...</p>
          </div>
        )}

        {!loading && error && (
          <div className="notification_state">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && notifications.length === 0 && (
          <div className="notification_empty">
            <div className="notification_empty_icon">
              <Bell />
            </div>

            <h2>No messages yet</h2>

            <p>Your order updates and important messages will appear here.</p>
          </div>
        )}

        {!loading &&
          !error &&
          notifications.length > 0 &&
          notifications.map((notification) => (
            <button
              key={notification._id}
              type="button"
              className={`notification_card ${
                notification.isRead ? 'read' : 'unread'
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="notification_card_content">
                <h2>{notification.title}</h2>

                <p>{notification.message}</p>

                <span>{formatDate(notification.createdAt)}</span>
              </div>
            </button>
          ))}
      </section>

      {selectedNotification && (
        <div
          className="notification_modal_overlay"
          onClick={() => setSelectedNotification(null)}
        >
          <div
            className="notification_modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="notification_modal_header">
              <div className="notification_modal_icon">
                <Bell />
              </div>

              <button
                type="button"
                className="notification_modal_close"
                onClick={() => setSelectedNotification(null)}
              >
                <X />
              </button>
            </div>

            <div className="notification_modal_content">
              <span className="notification_modal_type">
                {getNotificationStatus(selectedNotification.type)}
              </span>

              <h2>{selectedNotification.title}</h2>

              <p className="notification_modal_message">
                {selectedNotification.message}
              </p>

              <div className="notification_details">
                <h3>Notification Details</h3>

                {selectedNotification.orderId && (
                  <div className="notification_detail_row">
                    <span>Order ID</span>
                    <strong>{selectedNotification.orderId}</strong>
                  </div>
                )}

                <div className="notification_detail_row">
                  <span>Status</span>
                  <strong>
                    {getNotificationStatus(selectedNotification.type)}
                  </strong>
                </div>

                <div className="notification_detail_row">
                  <span>Received</span>
                  <strong>{formatDate(selectedNotification.createdAt)}</strong>
                </div>
              </div>

              <div className="notification_modal_footer">
                {selectedNotification.type === 'ORDER_ACCEPTED' && (
                  <p>
                    Your order has been accepted by the shop and will be
                    prepared shortly.
                  </p>
                )}

                {selectedNotification.type === 'ORDER_PREPARING' && (
                  <p>
                    The shop is currently preparing your order. We will notify
                    you when it is ready.
                  </p>
                )}

                {selectedNotification.type === 'ORDER_READY' && (
                  <p>
                    Your order is ready. You can proceed with pickup or wait for
                    delivery.
                  </p>
                )}

                {selectedNotification.type === 'ORDER_OUT_FOR_DELIVERY' && (
                  <p>
                    Your order is on the way. Please keep your phone available
                    for delivery updates.
                  </p>
                )}

                {selectedNotification.type === 'ORDER_COMPLETED' && (
                  <p>
                    Your order has been completed. Thank you for ordering with
                    RMA.
                  </p>
                )}

                {selectedNotification.type === 'ORDER_REJECTED' && (
                  <p>Unfortunately, the shop could not accept this order.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default Notifications;
