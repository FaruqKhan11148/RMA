function OrderIdField({ orderId, setOrderId }) {
  return (
    <div className="report_issue_field">
      <label htmlFor="orderId">
        Order ID
        <span>Optional</span>
      </label>

      <input
        id="orderId"
        type="text"
        value={orderId}
        onChange={(e) => setOrderId(e.target.value)}
        placeholder="Example: RMA-ORD-12345"
      />
    </div>
  );
}

export default OrderIdField;
