function FinanceHeader({ onBack }) {
  return (
    <div className="admin-finance-header">
      <div>
        <button className="finance-back-button" onClick={onBack}>
          ← Dashboard
        </button>

        <h1>Finance</h1>

        <p>
          Complete financial overview of RMA orders, platform revenue and shop
          settlements.
        </p>
      </div>

      <div className="finance-fee-info">
        <span>RMA Platform Fee</span>
        <strong>1%</strong>
      </div>
    </div>
  );
}

export default FinanceHeader;
