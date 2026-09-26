function PaymentsHeader({ onBack }) {
  return (
    <div className="admin-payments-header">
      <div>
        <button className="payments-back-button" onClick={onBack}>
          ← Dashboard
        </button>

        <h1>Payments Management</h1>

        <p>
          Monitor customer payments, payment status and transaction information.
        </p>
      </div>
    </div>
  );
}

export default PaymentsHeader;
