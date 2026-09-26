function DeliveryDetailsModal({
  selectedPerson,
  showModal,
  onClose,
  formatDate,
  getStatusClass,
  getReadableStatus,
}) {
  if (!showModal || !selectedPerson) {
    return null;
  }

  return (
    <div className="delivery-modal-overlay" onClick={onClose}>
      <div
        className="delivery-modal"
        onClick={(event) => event.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="delivery-modal-header">
          <div>
            <h2>{selectedPerson.name}</h2>

            <p>Delivery Person • {selectedPerson.shopId}</p>
          </div>

          <button className="modal-close-button" onClick={onClose}>
            ×
          </button>
        </div>

        {/* PERSON INFO */}
        <div className="delivery-detail-section">
          <h3>Delivery Person</h3>

          <div className="delivery-detail-grid">
            <div>
              <span>Name</span>
              <strong>{selectedPerson.name}</strong>
            </div>

            <div>
              <span>Phone</span>
              <strong>{selectedPerson.phone}</strong>
            </div>

            <div>
              <span>Shop ID</span>
              <strong>{selectedPerson.shopId}</strong>
            </div>

            <div>
              <span>Status</span>
              <strong>{selectedPerson.isActive ? 'Active' : 'Inactive'}</strong>
            </div>

            <div>
              <span>Registered</span>
              <strong>{formatDate(selectedPerson.createdAt)}</strong>
            </div>

            <div>
              <span>Last Updated</span>
              <strong>{formatDate(selectedPerson.updatedAt)}</strong>
            </div>
          </div>
        </div>

        {/* SHOP / OWNER */}
        <div className="delivery-detail-section">
          <h3>Shop & Owner</h3>

          <div className="delivery-detail-grid">
            <div>
              <span>Shop</span>
              <strong>{selectedPerson.ownerId?.shopName || '—'}</strong>
            </div>

            <div>
              <span>Shop ID</span>
              <strong>{selectedPerson.ownerId?.shopId || '—'}</strong>
            </div>

            <div>
              <span>Owner</span>
              <strong>{selectedPerson.ownerId?.ownerName || '—'}</strong>
            </div>

            <div>
              <span>Owner Phone</span>
              <strong>{selectedPerson.ownerId?.phone || '—'}</strong>
            </div>
          </div>
        </div>

        {/* DELIVERY SUMMARY */}
        <div className="delivery-detail-section">
          <h3>Delivery Summary</h3>

          <div className="delivery-summary-grid">
            <div>
              <span>Active</span>
              <strong>{selectedPerson.activeOrders || 0}</strong>
            </div>

            <div>
              <span>Completed</span>
              <strong>{selectedPerson.completedOrders || 0}</strong>
            </div>

            <div>
              <span>Total</span>
              <strong>{selectedPerson.totalDeliveryOrders || 0}</strong>
            </div>
          </div>
        </div>

        {/* ORDER HISTORY */}
        <div className="delivery-detail-section">
          <h3>Delivery Order History</h3>

          {!selectedPerson.orders || selectedPerson.orders.length === 0 ? (
            <div className="no-delivery-orders">No delivery orders found.</div>
          ) : (
            <div className="delivery-order-list">
              {selectedPerson.orders.map((order) => (
                <div className="delivery-order-card" key={order._id}>
                  <div className="delivery-order-top">
                    <div>
                      <strong>{order.orderId}</strong>

                      <span>{formatDate(order.createdAt)}</span>
                    </div>

                    <span
                      className={`order-status ${getStatusClass(order.status)}`}
                    >
                      {getReadableStatus(order.status)}
                    </span>
                  </div>

                  <div className="delivery-order-info">
                    <div>
                      <span>Customer</span>
                      <strong>{order.customer?.name || '—'}</strong>
                    </div>

                    <div>
                      <span>Phone</span>
                      <strong>{order.customer?.phone || '—'}</strong>
                    </div>

                    <div>
                      <span>Amount</span>
                      <strong>
                        ₹{Number(order.totalPrice || 0).toFixed(2)}
                      </strong>
                    </div>

                    <div>
                      <span>Payment</span>
                      <strong>{order.paymentStatus || 'Pending'}</strong>
                    </div>

                    <div>
                      <span>Payment Method</span>
                      <strong>{order.paymentMethod || '—'}</strong>
                    </div>

                    <div>
                      <span>OTP</span>
                      <strong>
                        {order.otpVerified
                          ? 'Verified'
                          : order.deliveryOtpGeneratedAt
                            ? 'Generated'
                            : 'Not Generated'}
                      </strong>
                    </div>
                  </div>

                  {/* ORDER TIMELINE */}
                  <div className="delivery-order-timeline">
                    <div>
                      <span>Accepted</span>
                      <strong>{formatDate(order.acceptedAt)}</strong>
                    </div>

                    <div>
                      <span>Preparing</span>
                      <strong>{formatDate(order.preparingAt)}</strong>
                    </div>

                    <div>
                      <span>Ready</span>
                      <strong>{formatDate(order.readyAt)}</strong>
                    </div>

                    <div>
                      <span>Out for Delivery</span>
                      <strong>{formatDate(order.outForDeliveryAt)}</strong>
                    </div>

                    <div>
                      <span>Completed</span>
                      <strong>{formatDate(order.completedAt)}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CLOSE */}
        <div className="delivery-modal-footer">
          <button className="modal-footer-close" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeliveryDetailsModal;
