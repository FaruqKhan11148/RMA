function NotificationsHeader({ unreadCount }) {
  return (
    <section className="notifications_header">
      <div>
        <h1>Messages</h1>

        <p>Stay updated with your orders and RMA.</p>
      </div>

      {unreadCount > 0 && (
        <span className="notifications_unread_count">{unreadCount}</span>
      )}
    </section>
  );
}

export default NotificationsHeader;
