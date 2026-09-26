function FinanceOrderModal({
  selectedOrder,
  onClose,
  formatMoney,
  formatDate,
}) {
  if (!selectedOrder) {
    return null;
  }

  return (
    <div className="finance-modal-overlay" onClick={onClose}>
      <div
        className="finance-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="finance-modal-header">
          <div>
            <span>Order Finance</span>
            <h2>{selectedOrder.orderId}</h2>
          </div>

          <button className="finance-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="finance-modal-content">
          <div className="finance-detail-grid">
            <div>
              <span>Gross Order Value</span>
              <strong>{formatMoney(selectedOrder.totalPrice)}</strong>
            </div>

            <div>
              <span>RMA Platform Fee</span>
              <strong className="finance-rma-value">
                {formatMoney(selectedOrder.rmaFee)}
              </strong>
            </div>

            <div>
              <span>Owner Settlement</span>
              <strong className="finance-owner-value">
                {formatMoney(selectedOrder.ownerAmount)}
              </strong>
            </div>

            <div>
              <span>Payment Status</span>
              <strong>{selectedOrder.paymentStatus || '-'}</strong>
            </div>
          </div>

          <div className="finance-modal-section">
            <h3>Customer</h3>

            <p>
              <strong>{selectedOrder.customer?.name || '-'}</strong>
            </p>

            <p>{selectedOrder.customer?.phone || '-'}</p>
          </div>

          <div className="finance-modal-section">
            <h3>Shop</h3>

            <p>
              <strong>{selectedOrder.ownerId?.shopName || '-'}</strong>
            </p>

            <p>Shop ID: {selectedOrder.ownerId?.shopId || '-'}</p>

            <p>Owner: {selectedOrder.ownerId?.ownerName || '-'}</p>
          </div>

          <div className="finance-modal-section">
            <h3>Payment</h3>

            <div className="finance-modal-info">
              <span>Method</span>
              <strong>{selectedOrder.paymentMethod || '-'}</strong>
            </div>

            <div className="finance-modal-info">
              <span>Online Method</span>
              <strong>{selectedOrder.onlinePaymentMethod || '-'}</strong>
            </div>

            <div className="finance-modal-info">
              <span>Payment ID</span>
              <strong>{selectedOrder.paymentId || '-'}</strong>
            </div>

            <div className="finance-modal-info">
              <span>Payment Order ID</span>
              <strong>{selectedOrder.paymentOrderId || '-'}</strong>
            </div>

            <div className="finance-modal-info">
              <span>Paid At</span>
              <strong>{formatDate(selectedOrder.paidAt)}</strong>
            </div>
          </div>

          <div className="finance-modal-section">
            <h3>Order Timeline</h3>

            <div className="finance-timeline">
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
                <span>Out For Delivery</span>
                <strong>{formatDate(selectedOrder.outForDeliveryAt)}</strong>
              </div>

              <div>
                <span>Completed</span>
                <strong>{formatDate(selectedOrder.completedAt)}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="finance-modal-footer">
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default FinanceOrderModal;
