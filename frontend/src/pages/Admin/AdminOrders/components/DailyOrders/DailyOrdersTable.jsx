function DailyOrdersTable({
  orders,
  formatCurrency,
  formatDateTime,
  onViewOrder,
}) {
  return (
    <section className="admin-daily-section">
      <div className="admin-daily-section-header">
        <div>
          <h2>Today's Orders</h2>

          <p>Every order placed during today's Indian business day.</p>
        </div>

        <span className="admin-daily-count">{orders.length} Orders</span>
      </div>

      {orders.length === 0 ? (
        <div className="admin-daily-empty">No orders placed today.</div>
      ) : (
        <div className="admin-daily-table-wrapper">
          <table className="admin-daily-table admin-orders-daily-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Shop</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Placed</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr key={order.orderId}>
                  <td>
                    <button
                      type="button"
                      className="admin-daily-order-button"
                      onClick={() => onViewOrder(order.orderId)}
                    >
                      {order.orderId}
                    </button>
                  </td>

                  <td>
                    <strong>{order.ownerId?.shopName || 'Unknown Shop'}</strong>

                    <small>{order.ownerId?.shopId || '—'}</small>
                  </td>

                  <td>
                    <strong>{order.customer?.name || '—'}</strong>

                    <small>{order.customer?.phone || '—'}</small>
                  </td>

                  <td>{formatCurrency(order.totalPrice)}</td>

                  <td>
                    <span
                      className={`admin-daily-payment ${(
                        order.paymentStatus || ''
                      ).toLowerCase()}`}
                    >
                      {order.paymentStatus || '—'}
                    </span>

                    <small>{order.paymentMethod || '—'}</small>
                  </td>

                  <td>
                    <span
                      className={`admin-daily-order-status ${(
                        order.status || ''
                      ).toLowerCase()}`}
                    >
                      {order.status || '—'}
                    </span>
                  </td>

                  <td>{formatDateTime(order.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default DailyOrdersTable;
