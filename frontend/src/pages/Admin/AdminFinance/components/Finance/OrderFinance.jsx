function OrderFinance({
  filteredOrders,
  orders,
  search,
  paymentFilter,
  onSearchChange,
  onPaymentFilterChange,
  onViewOrder,
  formatMoney,
  formatDate,
  getPaymentClass,
}) {
  return (
    <div className="finance-section">
      <div className="finance-section-header">
        <div>
          <h2>Order Finance</h2>
          <p>RMA fee and owner settlement calculated for every order.</p>
        </div>
      </div>

      <div className="finance-controls">
        <input
          type="text"
          placeholder="Search order, customer, phone or shop..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />

        <select
          value={paymentFilter}
          onChange={(event) => onPaymentFilterChange(event.target.value)}
        >
          <option value="ALL">All Payments</option>
          <option value="Paid">Paid</option>
          <option value="Pending">Pending</option>
          <option value="Failed">Failed</option>
          <option value="Refunded">Refunded</option>
        </select>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="finance-empty">No orders found.</div>
      ) : (
        <div className="finance-table-wrapper">
          <table className="finance-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Shop</th>
                <th>Gross</th>
                <th>RMA 1%</th>
                <th>Owner Amount</th>
                <th>Payment</th>
                <th>Order Status</th>
                <th>Placed At</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.map((order) => {
                const owner = order.ownerId || {};

                return (
                  <tr key={order._id || order.orderId}>
                    <td>
                      <strong>{order.orderId}</strong>
                    </td>

                    <td>
                      <div className="finance-shop-name">
                        <strong>{owner.shopName || '-'}</strong>

                        <span>{owner.shopId || '-'}</span>
                      </div>
                    </td>

                    <td>{formatMoney(order.totalPrice)}</td>

                    <td className="finance-rma-value">
                      {formatMoney(order.rmaFee)}
                    </td>

                    <td className="finance-owner-value">
                      {formatMoney(order.ownerAmount)}
                    </td>

                    <td>
                      <span className={getPaymentClass(order.paymentStatus)}>
                        {order.paymentStatus || 'Unknown'}
                      </span>
                    </td>

                    <td>
                      <span className="finance-order-status">
                        {order.status || '-'}
                      </span>
                    </td>

                    <td>{formatDate(order.createdAt)}</td>

                    <td>
                      <button
                        className="finance-view-button"
                        onClick={() => onViewOrder(order)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="finance-results-count">
        Showing {filteredOrders.length} of {orders.length} orders
      </div>
    </div>
  );
}

export default OrderFinance;
