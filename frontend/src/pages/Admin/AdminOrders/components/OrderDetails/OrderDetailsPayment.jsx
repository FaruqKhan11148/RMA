function OrderDetailsPayment({ order, formatDateTime }) {
  return (
    <section className="admin-order-card">
      <div className="admin-order-card-header">
        <div>
          <h2>Payment</h2>
          <p>Payment and transaction information.</p>
        </div>
      </div>

      <div className="admin-order-info-grid">
        <div>
          <span>Payment Status</span>
          <strong
            className={`admin-payment-badge ${(
              order.paymentStatus || ''
            ).toLowerCase()}`}
          >
            {order.paymentStatus || '—'}
          </strong>
        </div>

        <div>
          <span>Payment Method</span>
          <strong>{order.paymentMethod || '—'}</strong>
        </div>

        {order.paymentMethod === 'ONLINE' && (
          <>
            <div>
              <span>Online Method</span>
              <strong>{order.onlinePaymentMethod || '—'}</strong>
            </div>

            <div>
              <span>Payment ID</span>
              <strong>{order.paymentId || '—'}</strong>
            </div>

            <div>
              <span>Payment Order ID</span>
              <strong>{order.paymentOrderId || '—'}</strong>
            </div>

            <div>
              <span>Paid At</span>
              <strong>{formatDateTime(order.paidAt)}</strong>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default OrderDetailsPayment;
