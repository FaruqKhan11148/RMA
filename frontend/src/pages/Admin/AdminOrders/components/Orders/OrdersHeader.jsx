function OrdersHeader({ onBack }) {
  return (
    <div className="admin-orders-header">
      <button
        type="button"
        className="admin-orders-back-button"
        onClick={onBack}
      >
        ← Back
      </button>

      <div>
        <h1>Order Management</h1>
        <p>Monitor and manage all customer orders</p>
      </div>
    </div>
  );
}

export default OrdersHeader;
