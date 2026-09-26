function MonthlyFinanceHeader({ selectedMonth, onMonthChange, onBack }) {
  return (
    <div className="admin_monthly_finance_header">
      <div>
        <button type="button" className="admin_back_button" onClick={onBack}>
          ← Back
        </button>

        <h1>Monthly Finance</h1>

        <p>
          Revenue and transaction overview for <strong>{selectedMonth}</strong>
        </p>
      </div>

      <div className="admin_month_selector">
        <label htmlFor="finance_month">Select Month</label>

        <input
          id="finance_month"
          type="month"
          value={selectedMonth}
          onChange={(event) => onMonthChange(event.target.value)}
        />
      </div>
    </div>
  );
}

export default MonthlyFinanceHeader;
