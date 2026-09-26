function RecentOrders({ recentOrders, onOrderClick }) {
  return (
    <section className="admin-recent-orders">
      <div className="admin-section-header">
        <div>
          <h2>Recent Orders</h2>
          <p>Latest orders received by this shop.</p>
        </div>

        <span className="admin-section-count">
          {recentOrders.length} Orders
        </span>
      </div>

      {recentOrders.length === 0 ? (
        <div className="admin-recent-orders-empty">
          No orders found for this shop.
        </div>
      ) : (
        <div className="admin-orders-table-wrapper">
          <table className="admin-orders-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Placed</th>
                <th>Completed</th>
              </tr>
            </thead>

            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.orderId}>
                  <td>
                    <button
                      type="button"
                      className="admin-order-id-button"
                      onClick={() => onOrderClick(order.orderId)}
                    >
                      {order.orderId}
                    </button>
                  </td>

                  <td>₹{Number(order.totalPrice || 0).toFixed(2)}</td>

                  <td>
                    <span
                      className={`admin-payment-status ${
                        order.paymentStatus?.toLowerCase() || ''
                      }`}
                    >
                      {order.paymentStatus || 'Unknown'}
                    </span>

                    <small>{order.paymentMethod || '—'}</small>
                  </td>

                  <td>
                    <span
                      className={`admin-order-status ${(
                        order.status || ''
                      ).toLowerCase()}`}
                    >
                      {order.status || 'Unknown'}
                    </span>
                  </td>

                  <td>
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleString()
                      : '—'}
                  </td>

                  <td>
                    {order.completedAt
                      ? new Date(order.completedAt).toLocaleString()
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default RecentOrders;
