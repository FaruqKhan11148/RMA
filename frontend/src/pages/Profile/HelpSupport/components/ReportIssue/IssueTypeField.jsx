function IssueTypeField({ issueType, setIssueType }) {
  return (
    <div className="report_issue_field">
      <label htmlFor="issueType">Issue Type</label>

      <select
        id="issueType"
        value={issueType}
        onChange={(e) => setIssueType(e.target.value)}
      >
        <option value="">Select an issue</option>

        <option value="order_not_received">Order not received</option>

        <option value="wrong_items">Wrong items</option>

        <option value="missing_items">Missing items</option>

        <option value="damaged_items">Damaged items</option>

        <option value="payment_problem">Payment problem</option>

        <option value="delivery_problem">Delivery problem</option>

        <option value="shop_problem">Shop problem</option>

        <option value="other">Other</option>
      </select>
    </div>
  );
}

export default IssueTypeField;
