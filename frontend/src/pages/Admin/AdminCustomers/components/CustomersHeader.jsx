function CustomersHeader({ onBack }) {
  return (
    <div className="admin-customers-header">
      <div>
        <button className="back-button" onClick={onBack}>
          ← Dashboard
        </button>

        <h1>Customers</h1>

        <p>View customers and their complete RMA order history.</p>
      </div>

      <button className="admin-customers-back-btn" onClick={onBack}>
        Dashboard
      </button>
    </div>
  );
}

export default CustomersHeader;
