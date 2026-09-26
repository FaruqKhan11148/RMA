function MonthlyFinanceSummary({ stats, formatCurrency }) {
  return (
    <section className="admin_finance_summary_grid">
      <div className="admin_finance_card">
        <span>Total Orders</span>
        <strong>{stats.totalOrders}</strong>
      </div>

      <div className="admin_finance_card">
        <span>Completed Orders</span>
        <strong>{stats.completedOrders}</strong>
      </div>

      <div className="admin_finance_card">
        <span>Paid Orders</span>
        <strong>{stats.paidOrders}</strong>
      </div>

      <div className="admin_finance_card">
        <span>Pending Orders</span>
        <strong>{stats.pendingOrders}</strong>
      </div>

      <div className="admin_finance_card">
        <span>Rejected Orders</span>
        <strong>{stats.rejectedOrders}</strong>
      </div>

      <div className="admin_finance_card">
        <span>Total Transaction Value</span>
        <strong>{formatCurrency(stats.totalTransactionValue)}</strong>
      </div>

      <div className="admin_finance_card">
        <span>Completed Revenue</span>
        <strong>{formatCurrency(stats.completedTransactionValue)}</strong>
      </div>

      <div className="admin_finance_card admin_rma_fee_card">
        <span>RMA Fees (1%)</span>
        <strong>{formatCurrency(stats.totalRmaFees)}</strong>
      </div>
    </section>
  );
}

export default MonthlyFinanceSummary;
