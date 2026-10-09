function NotificationsSkeleton() {
  return (
    <section
      className="notifications_skeleton"
      aria-label="Loading notifications"
      aria-busy="true"
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <article className="notification_skeleton_card" key={index}>
          <span className="notification_skeleton_icon" />

          <div className="notification_skeleton_content">
            <div className="notification_skeleton_top">
              <span className="notification_skeleton_line notification_skeleton_title" />
              <span className="notification_skeleton_line notification_skeleton_date" />
            </div>

            <span className="notification_skeleton_line notification_skeleton_message" />
            <span className="notification_skeleton_line notification_skeleton_message_short" />
          </div>
        </article>
      ))}
    </section>
  );
}

export default NotificationsSkeleton;
