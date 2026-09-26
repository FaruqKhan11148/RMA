function FinanceStats({ financeSummary, formatMoney }) {
  return (
    <div className="finance-stats-grid">
      <div className="finance-stat-card">
        <span>Gross Order Value</span>
        <strong>{formatMoney(financeSummary.grossOrderValue)}</strong>
        <small>{financeSummary.totalOrders} total orders</small>
      </div>

      <div className="finance-stat-card finance-rma-card">
        <span>RMA Revenue</span>
        <strong>{formatMoney(financeSummary.totalRmaRevenue)}</strong>
        <small>1% platform fee</small>
      </div>

      <div className="finance-stat-card">
        <span>Owner Settlement</span>
        <strong>{formatMoney(financeSummary.totalOwnerSettlement)}</strong>
        <small>After RMA platform fee</small>
      </div>

      <div className="finance-stat-card">
        <span>Paid Revenue</span>
        <strong>{formatMoney(financeSummary.paidRevenue)}</strong>
        <small>{financeSummary.paidOrders} paid orders</small>
      </div>

      <div className="finance-stat-card">
        <span>Pending Payments</span>
        <strong>{formatMoney(financeSummary.pendingPaymentValue)}</strong>
        <small>{financeSummary.pendingOrders} pending orders</small>
      </div>

      <div className="finance-stat-card">
        <span>Refunded</span>
        <strong>{formatMoney(financeSummary.refundedValue)}</strong>
        <small>{financeSummary.refundedOrders} refunded orders</small>
      </div>
    </div>
  );
}

export default FinanceStats;
