function MonthlyOrderStatus({ orderStatus, formatStatus }) {
  return (
    <section className="admin_finance_section">
      <div className="admin_finance_section_header">
        <h2>Order Status</h2>
      </div>

      <div className="admin_status_grid">
        {Object.entries(orderStatus).map(([status, count]) => (
          <div className="admin_status_card" key={status}>
            <span>{formatStatus(status)}</span>
            <strong>{count}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

export default MonthlyOrderStatus;
