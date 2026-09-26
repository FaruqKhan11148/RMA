function OrdersFinance({ stats }) {
  return (
    <div className="admin-orders-finance">
      <div>
        <span>Total Revenue</span>

        <strong>₹{Number(stats.totalRevenue || 0).toFixed(2)}</strong>
      </div>

      <div>
        <span>Total RMA Fee</span>

        <strong>₹{Number(stats.totalRmaFee || 0).toFixed(2)}</strong>
      </div>

      <div>
        <span>Total Owner Amount</span>

        <strong>₹{Number(stats.totalOwnerAmount || 0).toFixed(2)}</strong>
      </div>
    </div>
  );
}

export default OrdersFinance;
