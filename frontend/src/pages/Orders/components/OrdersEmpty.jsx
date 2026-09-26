function OrdersEmpty({ loading, onStartOrdering }) {
  if (loading) {
    return (
      <div className="orders_empty">
        <h1>Orders</h1>
        <p>Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="orders_empty">
      <h1>No Orders Yet</h1>

      <p>Your orders will appear here once you place an order from a shop.</p>

      <button type="button" onClick={onStartOrdering}>
        Start Ordering
      </button>
    </div>
  );
}

export default OrdersEmpty;
