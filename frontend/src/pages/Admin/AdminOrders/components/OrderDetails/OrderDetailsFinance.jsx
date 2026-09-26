function OrderDetailsFinance({ order }) {
  return (
    <section className="admin-order-card">
      <div className="admin-order-card-header">
        <div>
          <h2>Finance</h2>
          <p>RMA platform fee and owner settlement.</p>
        </div>
      </div>

      <div className="admin-finance-grid">
        <div>
          <span>Order Value</span>
          <strong>₹{Number(order.totalPrice || 0).toFixed(2)}</strong>
        </div>

        <div>
          <span>RMA Fee (1%)</span>
          <strong>₹{Number(order.rmaFee || 0).toFixed(2)}</strong>
        </div>

        <div>
          <span>Owner Amount</span>
          <strong>₹{Number(order.ownerAmount || 0).toFixed(2)}</strong>
        </div>
      </div>
    </section>
  );
}

export default OrderDetailsFinance;
