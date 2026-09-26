import { Bell } from 'lucide-react';

function NotificationsList({
  loading,
  error,
  notifications,
  handleNotificationClick,
  formatDate,
}) {
  return (
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
  );
}

export default NotificationsList;
