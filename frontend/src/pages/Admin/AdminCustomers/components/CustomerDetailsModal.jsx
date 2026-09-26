function CustomerDetailsModal({
  customer,
  error,
  onClose,
  onViewOrder,
  formatDate,
}) {
  if (!customer) {
    return null;
  }

  return (
    <div className="admin-customer-modal-overlay" onClick={onClose}>
      <div
        className="admin-customer-modal"
        onClick={(event) => event.stopPropagation()}
      >
        {error && <div className="admin-customers-error">{error}</div>}

        <div className="admin-customer-modal-header">
          <div>
            <h2>{customer.name}</h2>
            <p>{customer.phone}</p>
          </div>

          <button className="admin-customer-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="admin-customer-details">
          <div className="customer-detail-card">
            <span>Phone</span>
            <strong>{customer.phone}</strong>
          </div>

          <div className="customer-detail-card">
            <span>Total Orders</span>
            <strong>{customer.totalOrders || 0}</strong>
          </div>

          <div className="customer-detail-card">
            <span>Completed</span>
            <strong>{customer.completedOrders || 0}</strong>
          </div>

          <div className="customer-detail-card">
            <span>Pending</span>
            <strong>{customer.pendingOrders || 0}</strong>
          </div>

          <div className="customer-detail-card">
            <span>Rejected</span>
            <strong>{customer.rejectedOrders || 0}</strong>
          </div>

          <div className="customer-detail-card">
            <span>Total Paid</span>
            <strong>
              ₹{Number(customer.totalSpent || 0).toLocaleString('en-IN')}
            </strong>
          </div>

          <div className="customer-detail-card">
            <span>Last Order</span>
            <strong>{formatDate(customer.lastOrderAt)}</strong>
          </div>
        </div>

        <div className="admin-customer-address-section">
          <h3>Customer Address</h3>

          <p>{customer.address || 'No address'}</p>

          <h3>Delivery Location</h3>

          <p>{customer.deliveryLocation?.address || 'No delivery address'}</p>

          {customer.deliveryLocation?.latitude != null &&
            customer.deliveryLocation?.longitude != null && (
              <div className="admin-customer-location-actions">
                <p>
                  Coordinates: {customer.deliveryLocation.latitude},{' '}
                  {customer.deliveryLocation.longitude}
                </p>

                <a
                  className="admin-customer-map-btn"
                  href={`https://www.google.com/maps?q=${customer.deliveryLocation.latitude},${customer.deliveryLocation.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open Location
                </a>
              </div>
            )}
        </div>

        <div className="admin-customer-orders-section">
          <h3>Order History</h3>

          <div className="admin-customer-orders">
            {customer.orders?.map((order) => (
              <div className="admin-customer-order-card" key={order.orderId}>
                <div>
                  <button
                    type="button"
                    className="admin-customer-order-id"
                    onClick={() => onViewOrder(order.orderId)}
                  >
                    {order.orderId}
                  </button>

                  <span>{formatDate(order.createdAt)}</span>
                </div>

                <div>
                  <strong>
                    ₹{Number(order.totalPrice || 0).toLocaleString('en-IN')}
                  </strong>

                  <span
                    className={`customer-payment-status ${
                      order.paymentStatus?.toLowerCase() || ''
                    }`}
                  >
                    {order.paymentStatus}
                  </span>
                </div>

                <div>
                  <span
                    className={`customer-order-status ${
                      order.status?.toLowerCase().replace(/\s/g, '-') || ''
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerDetailsModal;
