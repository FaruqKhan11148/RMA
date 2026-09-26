function HistoryHeader({ orderCount }) {
  return (
    <header className="delivery_history_header">
      <div>
        <span>Delivery Partner</span>

        <h1>History</h1>

        <p>Your completed delivery orders.</p>
      </div>

      <div className="delivery_history_count">
        <strong>{orderCount}</strong>
        <span>Delivered</span>
      </div>
    </header>
  );
}

export default HistoryHeader;
