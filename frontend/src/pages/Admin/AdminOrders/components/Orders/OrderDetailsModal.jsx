function OrderDetailsModal({
  selectedOrder,
  onClose,
  formatDate,
  getStatusClass,
}) {
  if (!selectedOrder) {
    return null;
  }

  const order = selectedOrder;
  const customer = order.customer || {};
  const owner = order.ownerId || {};
  const delivery = order.delivery || {};

  return (
    <div className="admin-order-modal-overlay">
      <div className="admin-order-modal">
        {/* HEADER */}
        <div className="admin-order-modal-header">
          <div>
            <h2>Order Details</h2>

            <p>{order.orderId || '-'}</p>
          </div>

          <button
            type="button"
            className="modal-close-button"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {/* CURRENT STATUS */}
        <div className="order-modal-status">
          <span>Current Status</span>

          <span
            className={`order-status-badge ${getStatusClass(order.status)}`}
          >
            {order.status || '-'}
          </span>
        </div>

        {/* TIMELINE */}
        <div className="order-timeline-section">
          <h3>Order Timeline</h3>

          <div className="order-timeline">
            <div className="timeline-item timeline-completed">
              <div className="timeline-dot" />

              <div>
                <strong>Order Created</strong>

                <span>{formatDate(order.createdAt)}</span>
              </div>
            </div>

            {order.acceptedAt && (
              <div className="timeline-item timeline-completed">
                <div className="timeline-dot" />

                <div>
                  <strong>Accepted</strong>

                  <span>{formatDate(order.acceptedAt)}</span>
                </div>
              </div>
            )}

            {order.preparingAt && (
              <div className="timeline-item timeline-completed">
                <div className="timeline-dot" />

                <div>
                  <strong>Preparing</strong>

                  <span>{formatDate(order.preparingAt)}</span>
                </div>
              </div>
            )}

            {order.readyAt && (
              <div className="timeline-item timeline-completed">
                <div className="timeline-dot" />

                <div>
                  <strong>Ready</strong>

                  <span>{formatDate(order.readyAt)}</span>
                </div>
              </div>
            )}

            {order.outForDeliveryAt && (
              <div className="timeline-item timeline-completed">
                <div className="timeline-dot" />

                <div>
                  <strong>Out for Delivery</strong>

                  <span>{formatDate(order.outForDeliveryAt)}</span>
                </div>
              </div>
            )}

            {order.otpVerified && (
              <div className="timeline-item timeline-completed">
                <div className="timeline-dot" />

                <div>
                  <strong>OTP Verified</strong>

                  <span>Delivery OTP verified</span>
                </div>
              </div>
            )}

            {order.completedAt && (
              <div className="timeline-item timeline-completed">
                <div className="timeline-dot" />

                <div>
                  <strong>Completed</strong>

                  <span>{formatDate(order.completedAt)}</span>
                </div>
              </div>
            )}

            {order.rejectedAt && (
              <div className="timeline-item timeline-rejected">
                <div className="timeline-dot" />

                <div>
                  <strong>Rejected</strong>

                  <span>{formatDate(order.rejectedAt)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CUSTOMER */}
        <div className="order-detail-section">
          <h3>Customer Information</h3>

          <div className="order-detail-grid">
            <div>
              <label>Name</label>

              <p>{customer.name || '-'}</p>
            </div>

            <div>
              <label>Phone</label>

              <p>{customer.phone || '-'}</p>
            </div>

            {customer.email && (
              <div>
                <label>Email</label>

                <p>{customer.email}</p>
              </div>
            )}
          </div>
        </div>

        {/* SHOP / OWNER */}
        <div className="order-detail-section">
          <h3>Shop / Owner Information</h3>

          <div className="order-detail-grid">
            <div>
              <label>Shop Name</label>

              <p>{owner.shopName || '-'}</p>
            </div>

            <div>
              <label>Shop ID</label>

              <p>{owner.shopId || '-'}</p>
            </div>

            <div>
              <label>Owner Name</label>

              <p>{owner.ownerName || '-'}</p>
            </div>

            <div>
              <label>Owner Phone</label>

              <p>{owner.phone || owner.ownerPhone || '-'}</p>
            </div>
          </div>
        </div>

        {/* ITEMS */}
        <div className="order-detail-section">
          <h3>Order Items</h3>

          <div className="order-items">
            {(order.items || []).map((item, index) => {
              const quantity = Number(item.quantity || 0);

              const price = Number(item.price || 0);

              const lineTotal = price * quantity;

              return (
                <div
                  className="order-item"
                  key={
                    item.productId ||
                    item.catalogueProductId ||
                    `${item.name}-${index}`
                  }
                >
                  <div>
                    <strong>{item.name || '-'}</strong>

                    <span>
                      {quantity} × ₹{price.toFixed(2)}
                      {item.unit ? ` / ${item.unit}` : ''}
                    </span>
                  </div>

                  <strong>₹{lineTotal.toFixed(2)}</strong>
                </div>
              );
            })}
          </div>
        </div>

        {/* DELIVERY */}
        <div className="order-detail-section">
          <h3>Delivery Information</h3>

          <div className="order-detail-grid">
            <div>
              <label>Order Type</label>

              <p>{order.orderType || '-'}</p>
            </div>

            <div>
              <label>Delivery Status</label>

              <p>{order.deliveryStatus || '-'}</p>
            </div>

            <div>
              <label>Address</label>

              <p>
                {delivery.address ||
                  order.deliveryAddress ||
                  order.address ||
                  '-'}
              </p>
            </div>

            <div>
              <label>Latitude</label>

              <p>{delivery.latitude ?? order.latitude ?? '-'}</p>
            </div>

            <div>
              <label>Longitude</label>

              <p>{delivery.longitude ?? order.longitude ?? '-'}</p>
            </div>

            {order.distance !== undefined && (
              <div>
                <label>Distance</label>

                <p>{order.distance} KM</p>
              </div>
            )}

            {order.deliveryCharge !== undefined && (
              <div>
                <label>Delivery Charge</label>

                <p>₹{Number(order.deliveryCharge || 0).toFixed(2)}</p>
              </div>
            )}
          </div>
        </div>

        {/* PAYMENT */}
        <div className="order-detail-section">
          <h3>Payment Information</h3>

          <div className="order-detail-grid">
            <div>
              <label>Payment Status</label>

              <p>{order.paymentStatus || '-'}</p>
            </div>

            <div>
              <label>Payment Method</label>

              <p>{order.paymentMethod || '-'}</p>
            </div>

            <div>
              <label>Online Payment Method</label>

              <p>{order.onlinePaymentMethod || '-'}</p>
            </div>

            {order.transactionId && (
              <div>
                <label>Transaction ID</label>

                <p>{order.transactionId}</p>
              </div>
            )}

            {order.payuTransactionId && (
              <div>
                <label>PayU Transaction ID</label>

                <p>{order.payuTransactionId}</p>
              </div>
            )}

            <div>
              <label>Order Amount</label>

              <p>₹{Number(order.totalPrice || 0).toFixed(2)}</p>
            </div>

            <div>
              <label>Customer Paid</label>

              <p>
                ₹
                {Number(
                  order.customerPayableAmount ?? order.totalPrice ?? 0,
                ).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* FINANCE */}
        <div className="order-detail-section">
          <h3>Finance Information</h3>

          <div className="order-finance-grid">
            <div>
              <span>Order Total</span>

              <strong>₹{Number(order.totalPrice || 0).toFixed(2)}</strong>
            </div>

            <div>
              <span>RMA Fee</span>

              <strong>₹{Number(order.rmaFee || 0).toFixed(2)}</strong>
            </div>

            <div>
              <span>Owner Amount</span>

              <strong>₹{Number(order.ownerAmount || 0).toFixed(2)}</strong>
            </div>
          </div>

          {(order.payuFee !== undefined ||
            order.payuGst !== undefined ||
            order.payuCharges !== undefined) && (
            <div className="order-finance-grid">
              <div>
                <span>PayU Fee</span>

                <strong>₹{Number(order.payuFee || 0).toFixed(2)}</strong>
              </div>

              <div>
                <span>PayU GST</span>

                <strong>₹{Number(order.payuGst || 0).toFixed(2)}</strong>
              </div>

              <div>
                <span>PayU Charges</span>

                <strong>₹{Number(order.payuCharges || 0).toFixed(2)}</strong>
              </div>
            </div>
          )}
        </div>

        {/* DELIVERY OTP */}
        <div className="order-detail-section">
          <h3>Delivery OTP</h3>

          <div
            className={`otp-status-box ${
              order.otpVerified ? 'otp-verified' : 'otp-not-verified'
            }`}
          >
            <span>Status</span>

            <strong>
              {order.otpVerified ? 'OTP Verified' : 'OTP Not Verified'}
            </strong>

            {order.deliveryOtp && <small>OTP: {order.deliveryOtp}</small>}

            {order.otpVerifiedAt && (
              <small>Verified At: {formatDate(order.otpVerifiedAt)}</small>
            )}
          </div>
        </div>

        {/* SYSTEM TIMESTAMPS */}
        <div className="order-detail-section">
          <h3>System Timestamps</h3>

          <div className="order-detail-grid">
            <div>
              <label>Created At</label>

              <p>{formatDate(order.createdAt)}</p>
            </div>

            <div>
              <label>Updated At</label>

              <p>{formatDate(order.updatedAt)}</p>
            </div>

            {order.acceptedAt && (
              <div>
                <label>Accepted At</label>

                <p>{formatDate(order.acceptedAt)}</p>
              </div>
            )}

            {order.preparingAt && (
              <div>
                <label>Preparing At</label>

                <p>{formatDate(order.preparingAt)}</p>
              </div>
            )}

            {order.readyAt && (
              <div>
                <label>Ready At</label>

                <p>{formatDate(order.readyAt)}</p>
              </div>
            )}

            {order.outForDeliveryAt && (
              <div>
                <label>Out For Delivery At</label>

                <p>{formatDate(order.outForDeliveryAt)}</p>
              </div>
            )}

            {order.completedAt && (
              <div>
                <label>Completed At</label>

                <p>{formatDate(order.completedAt)}</p>
              </div>
            )}

            {order.rejectedAt && (
              <div>
                <label>Rejected At</label>

                <p>{formatDate(order.rejectedAt)}</p>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="admin-order-modal-footer">
          <button type="button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderDetailsModal;
