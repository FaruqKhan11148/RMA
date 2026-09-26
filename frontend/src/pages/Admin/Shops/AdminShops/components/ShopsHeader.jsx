function ShopsHeader({ loading, shopCount, onBack }) {
  return (
    <header className="admin-shops-header">
      <div>
        <button className="admin-shops-back" onClick={onBack}>
          ← Dashboard
        </button>

        <h1>Shops</h1>

        <p>View all registered RMA shops and their performance.</p>
      </div>

      <div className="admin-shops-count">
        {loading ? '...' : shopCount} Shops
      </div>
    </header>
  );
}

export default ShopsHeader;
