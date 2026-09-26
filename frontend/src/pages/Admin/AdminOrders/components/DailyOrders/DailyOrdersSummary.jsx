function DailyOrdersSummary({ stats, formatCurrency }) {
  return (
    <section className="admin-daily-summary">
      <div className="admin-daily-stat-card">
        <span>Total Orders</span>

        <strong>{stats.totalOrders || 0}</strong>
      </div>

      <div className="admin-daily-stat-card">
        <span>Completed</span>

        <strong>{stats.completedOrders || 0}</strong>
      </div>

      <div className="admin-daily-stat-card">
        <span>Transaction Value</span>

        <strong>{formatCurrency(stats.totalTransactionValue)}</strong>
      </div>

      <div className="admin-daily-stat-card">
        <span>Completed Value</span>

        <strong>{formatCurrency(stats.completedTransactionValue)}</strong>
      </div>

      <div className="admin-daily-stat-card">
        <span>RMA Fees</span>

        <strong>{formatCurrency(stats.totalRmaFees)}</strong>
      </div>
    </section>
  );
}

export default DailyOrdersSummary;
