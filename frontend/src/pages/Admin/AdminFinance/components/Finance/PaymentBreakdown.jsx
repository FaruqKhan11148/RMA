function PaymentBreakdown({ financeSummary, formatMoney }) {
  return (
    <div className="finance-section">
      <div className="finance-section-header">
        <div>
          <h2>Payment Breakdown</h2>
          <p>Current payment state across all orders.</p>
        </div>
      </div>

      <div className="finance-payment-grid">
        <div className="finance-payment-card">
          <span>Paid</span>
          <strong>{formatMoney(financeSummary.paidRevenue)}</strong>
          <small>{financeSummary.paidOrders} orders</small>
        </div>

        <div className="finance-payment-card">
          <span>Pending</span>
          <strong>{formatMoney(financeSummary.pendingPaymentValue)}</strong>
          <small>{financeSummary.pendingOrders} orders</small>
        </div>

        <div className="finance-payment-card">
          <span>Failed</span>
          <strong>{formatMoney(financeSummary.failedPaymentValue)}</strong>
          <small>{financeSummary.failedOrders} orders</small>
        </div>

        <div className="finance-payment-card">
          <span>Refunded</span>
          <strong>{formatMoney(financeSummary.refundedValue)}</strong>
          <small>{financeSummary.refundedOrders} orders</small>
        </div>
      </div>
    </div>
  );
}

export default PaymentBreakdown;
