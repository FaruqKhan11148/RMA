import {
  formatAmount,
  formatDate,
  getPaymentMethodLabel,
  getPaymentStatusClass,
} from '../utils/paymentHelpers';

function PaymentsTable({ loading, filteredOrders, onViewPayment }) {
  if (loading) {
    return <div className="payments-loading">Loading payments...</div>;
  }

  if (filteredOrders.length === 0) {
    return (
      <div className="payments-empty">
        <h3>No payments found</h3>

        <p>No payment records match your current search or filters.</p>
      </div>
    );
  }

  return (
    <div className="payments-table-wrapper">
      <table className="payments-table">
        <thead>
          <tr>
            <th>Order</th>
            <th>Customer</th>
            <th>Shop</th>
            <th>Amount</th>
            <th>Method</th>
            <th>Status</th>
            <th>Payment ID</th>
            <th>Paid At</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {filteredOrders.map((order) => {
            const owner = order.ownerId || {};
            const customer = order.customer || {};

            return (
              <tr key={order._id}>
                <td>
                  <div className="payment-order-cell">
                    <strong>{order.orderId}</strong>

                    <span>{formatDate(order.createdAt)}</span>
                  </div>
                </td>

                <td>
                  <div className="payment-customer-cell">
                    <strong>{customer.name || '—'}</strong>

                    <span>{customer.phone || '—'}</span>
                  </div>
                </td>

                <td>
                  <div className="payment-shop-cell">
                    <strong>{owner.shopName || '—'}</strong>

                    <span>{owner.shopId || '—'}</span>
                  </div>
                </td>

                <td>
                  <strong>{formatAmount(order.totalPrice)}</strong>
                </td>

                <td>
                  <span className="payment-method-badge">
                    {getPaymentMethodLabel(order)}
                  </span>
                </td>

                <td>
                  <span
                    className={`payment-status-badge ${getPaymentStatusClass(
                      order.paymentStatus,
                    )}`}
                  >
                    {order.paymentStatus || 'Pending'}
                  </span>
                </td>

                <td>
                  <span className="payment-id-cell">
                    {order.paymentId || '—'}
                  </span>
                </td>

                <td>{formatDate(order.paidAt)}</td>

                <td>
                  <button
                    className="view-payment-button"
                    onClick={() => onViewPayment(order)}
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
  );
}

export default PaymentsTable;
