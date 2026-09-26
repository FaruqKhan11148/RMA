import {
  formatAmount,
  formatDate,
  getPaymentMethodLabel,
  getPaymentStatusClass,
} from '../utils/paymentHelpers';

function PaymentDetailsModal({ selectedOrder, onClose }) {
  if (!selectedOrder) {
    return null;
  }

  return (
    <div className="payment-modal-overlay" onClick={onClose}>
      <div
        className="payment-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="payment-modal-header">
          <div>
            <h2>Payment Details</h2>

            <p>Order #{selectedOrder.orderId}</p>
          </div>

          <button className="payment-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="payment-modal-status">
          <span>Payment Status</span>

          <strong
            className={`payment-status-badge ${getPaymentStatusClass(
              selectedOrder.paymentStatus,
            )}`}
          >
            {selectedOrder.paymentStatus || 'Pending'}
          </strong>
        </div>

        <div className="payment-detail-section">
          <h3>Transaction</h3>

          <div className="payment-detail-grid">
            <div>
              <span>Order ID</span>
              <strong>{selectedOrder.orderId}</strong>
            </div>

            <div>
              <span>Amount</span>
              <strong>{formatAmount(selectedOrder.totalPrice)}</strong>
            </div>

            <div>
              <span>Payment Method</span>
              <strong>{getPaymentMethodLabel(selectedOrder)}</strong>
            </div>

            <div>
              <span>Payment ID</span>
              <strong>{selectedOrder.paymentId || '—'}</strong>
            </div>

            <div>
              <span>Payment Order ID</span>
              <strong>{selectedOrder.paymentOrderId || '—'}</strong>
            </div>

            <div>
              <span>Paid At</span>
              <strong>{formatDate(selectedOrder.paidAt)}</strong>
            </div>
          </div>
        </div>

        <div className="payment-detail-section">
          <h3>Customer</h3>

          <div className="payment-detail-grid">
            <div>
              <span>Name</span>
              <strong>{selectedOrder.customer?.name || '—'}</strong>
            </div>

            <div>
              <span>Phone</span>
              <strong>{selectedOrder.customer?.phone || '—'}</strong>
            </div>

            <div>
              <span>Address</span>
              <strong>{selectedOrder.customer?.address || '—'}</strong>
            </div>
          </div>
        </div>

        <div className="payment-detail-section">
          <h3>Shop</h3>

          <div className="payment-detail-grid">
            <div>
              <span>Shop Name</span>
              <strong>{selectedOrder.ownerId?.shopName || '—'}</strong>
            </div>

            <div>
              <span>Shop ID</span>
              <strong>{selectedOrder.ownerId?.shopId || '—'}</strong>
            </div>

            <div>
              <span>Owner</span>
              <strong>{selectedOrder.ownerId?.ownerName || '—'}</strong>
            </div>

            <div>
              <span>Owner Phone</span>
              <strong>{selectedOrder.ownerId?.phone || '—'}</strong>
            </div>
          </div>
        </div>

        <div className="payment-detail-section">
          <h3>Order Information</h3>

          <div className="payment-items-list">
            {selectedOrder.items?.map((item, index) => (
              <div className="payment-item" key={`${item.productId}-${index}`}>
                <div>
                  <strong>{item.productName}</strong>

                  <span>
                    {item.quantity} × {formatAmount(item.price)}
                  </span>
                </div>

                <strong>
                  {formatAmount(
                    Number(item.price || 0) * Number(item.quantity || 0),
                  )}
                </strong>
              </div>
            ))}
          </div>
        </div>

        <div className="payment-detail-section">
          <h3>Order Timestamps</h3>

          <div className="payment-detail-grid">
            <div>
              <span>Order Placed</span>
              <strong>{formatDate(selectedOrder.createdAt)}</strong>
            </div>

            <div>
              <span>Accepted</span>
              <strong>{formatDate(selectedOrder.acceptedAt)}</strong>
            </div>

            <div>
              <span>Preparing</span>
              <strong>{formatDate(selectedOrder.preparingAt)}</strong>
            </div>

            <div>
              <span>Ready</span>
              <strong>{formatDate(selectedOrder.readyAt)}</strong>
            </div>

            <div>
              <span>Out for Delivery</span>
              <strong>{formatDate(selectedOrder.outForDeliveryAt)}</strong>
            </div>

            <div>
              <span>Completed</span>
              <strong>{formatDate(selectedOrder.completedAt)}</strong>
            </div>
          </div>
        </div>

        <div className="payment-modal-footer">
          <button className="payment-modal-close-button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentDetailsModal;
