function DailyOrdersHeader({ date, onBack }) {
  return (
    <header className="admin-daily-orders-header">
      <div>
        <button type="button" className="admin-daily-back" onClick={onBack}>
          ← Dashboard
        </button>

        <h1>Daily Orders</h1>

        <p>All orders placed on {date} in India.</p>
      </div>

      <div className="admin-daily-date">{date}</div>
    </header>
  );
}

export default DailyOrdersHeader;
