function DailyOrdersStatus({ orderStatus }) {
  return (
    <section className="admin-daily-section">
      <div className="admin-daily-section-header">
        <div>
          <h2>Order Status</h2>

          <p>Today's order distribution.</p>
        </div>
      </div>

      <div className="admin-daily-status-grid">
        {[
          'Pending',
          'Accepted',
          'Preparing',
          'Ready',
          'OutForDelivery',
          'Completed',
          'Rejected',
        ].map((status) => (
          <div className="admin-daily-status-card" key={status}>
            <span>{status}</span>

            <strong>{orderStatus[status] || 0}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

export default DailyOrdersStatus;
