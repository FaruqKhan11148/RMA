function OrdersTable({
  orders,
  formatDate,
  getStatusClass,
  getPaymentClass,
  onViewOrder,
}) {
  return (
    <div className="admin-orders-table-wrapper">
      <table className="admin-orders-table">
        <thead>
          <tr>
            <th>Order</th>
            <th>Customer</th>
            <th>Shop</th>
            <th>Amount</th>
            <th>RMA Fee</th>
            <th>Owner Amount</th>
            <th>Payment</th>
            <th>Status</th>
            <th>Placed At</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {orders.length === 0 ? (
            <tr>
              <td colSpan="10" className="admin-orders-empty">
                No orders found.
              </td>
            </tr>
          ) : (
            orders.map((order) => {
              const owner = order.ownerId || {};
              const customer = order.customer || {};

              return (
                <tr key={order._id || order.orderId}>
                  {/* ORDER */}
                  <td>
                    <div className="order-id">{order.orderId || '-'}</div>

                    <small>{order.orderType || '-'}</small>
                  </td>

                  {/* CUSTOMER */}
                  <td>
                    <div className="customer-name">{customer.name || '-'}</div>

                    <small>{customer.phone || '-'}</small>
                  </td>

                  {/* SHOP */}
                  <td>
                    <div className="shop-name">{owner.shopName || '-'}</div>

                    <small>{owner.shopId || '-'}</small>

                    {owner.ownerName && <small>Owner: {owner.ownerName}</small>}
                  </td>

                  {/* AMOUNT */}
                  <td>
                    <strong>₹{Number(order.totalPrice || 0).toFixed(2)}</strong>
                  </td>

                  {/* RMA FEE */}
                  <td>
                    <span className="fee-value">
                      ₹{Number(order.rmaFee || 0).toFixed(2)}
                    </span>
                  </td>

                  {/* OWNER AMOUNT */}
                  <td>
                    <span className="owner-value">
                      ₹{Number(order.ownerAmount || 0).toFixed(2)}
                    </span>
                  </td>

                  {/* PAYMENT */}
                  <td>
                    <span
                      className={`payment-badge ${getPaymentClass(
                        order.paymentStatus,
                      )}`}
                    >
                      {order.paymentStatus || 'Pending'}
                    </span>

                    {order.paymentMethod && (
                      <small className="payment-method">
                        {order.paymentMethod}
                      </small>
                    )}

                    {order.onlinePaymentMethod && (
                      <small className="payment-method">
                        {order.onlinePaymentMethod}
                      </small>
                    )}
                  </td>

                  {/* STATUS */}
                  <td>
                    <span
                      className={`order-status-badge ${getStatusClass(
                        order.status,
                      )}`}
                    >
                      {order.status || '-'}
                    </span>
                  </td>

                  {/* PLACED AT */}
                  <td>
                    <small>{formatDate(order.createdAt)}</small>
                  </td>

                  {/* ACTION */}
                  <td>
                    <button
                      type="button"
                      className="view-order-button"
                      onClick={() => onViewOrder(order)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export default OrdersTable;
