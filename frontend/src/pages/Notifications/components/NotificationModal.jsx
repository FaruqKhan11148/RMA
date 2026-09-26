import { Bell, X } from 'lucide-react';

function NotificationModal({
  selectedNotification,
  setSelectedNotification,
  getNotificationStatus,
  formatDate,
}) {
  if (!selectedNotification) {
    return null;
  }

  return (
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
                Your order has been accepted by the shop and will be prepared
                shortly.
              </p>
            )}

            {selectedNotification.type === 'ORDER_PREPARING' && (
              <p>
                The shop is currently preparing your order. We will notify you
                when it is ready.
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
                Your order is on the way. Please keep your phone available for
                delivery updates.
              </p>
            )}

            {selectedNotification.type === 'ORDER_COMPLETED' && (
              <p>
                Your order has been delivered successfully. Thank you for
                ordering with RMA. Please rate your experience with RMA, the
                shop, and delivery.
              </p>
            )}

            {selectedNotification.type === 'ORDER_REJECTED' && (
              <p>Unfortunately, the shop could not accept this order.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotificationModal;
