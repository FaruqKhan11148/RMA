function PaymentFilters({
  search,
  setSearch,
  paymentStatusFilter,
  setPaymentStatusFilter,
  paymentMethodFilter,
  setPaymentMethodFilter,
}) {
  return (
    <div className="payments-controls">
      <input
        type="text"
        placeholder="Search order, customer, shop, payment ID..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      <select
        value={paymentStatusFilter}
        onChange={(event) => setPaymentStatusFilter(event.target.value)}
      >
        <option value="ALL">All Payment Status</option>
        <option value="Paid">Paid</option>
        <option value="Pending">Pending</option>
        <option value="Failed">Failed</option>
        <option value="Refunded">Refunded</option>
      </select>

      <select
        value={paymentMethodFilter}
        onChange={(event) => setPaymentMethodFilter(event.target.value)}
      >
        <option value="ALL">All Methods</option>
        <option value="ONLINE">Online</option>
        <option value="COD">COD</option>
      </select>
    </div>
  );
}

export default PaymentFilters;
