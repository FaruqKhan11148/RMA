function OrdersFilters({
  search,
  statusFilter,
  paymentFilter,
  filteredCount,
  totalCount,
  onSearchChange,
  onStatusChange,
  onPaymentChange,
}) {
  return (
    <>
      <div className="admin-orders-controls">
        <div className="admin-orders-search">
          <input
            type="text"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by order ID, customer, phone, shop..."
          />
        </div>

        <div className="admin-orders-filter">
          <select
            value={statusFilter}
            onChange={(event) => onStatusChange(event.target.value)}
          >
            <option value="All">All Status</option>

            <option value="Pending">Pending</option>

            <option value="Accepted">Accepted</option>

            <option value="Preparing">Preparing</option>

            <option value="Ready">Ready</option>

            <option value="OutForDelivery">Out for Delivery</option>

            <option value="Completed">Completed</option>

            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div className="admin-orders-filter">
          <select
            value={paymentFilter}
            onChange={(event) => onPaymentChange(event.target.value)}
          >
            <option value="All">All Payments</option>

            <option value="Paid">Paid</option>

            <option value="Pending">Pending</option>

            <option value="Failed">Failed</option>

            <option value="Refunded">Refunded</option>
          </select>
        </div>
      </div>

      <div className="admin-orders-result-count">
        Showing <strong>{filteredCount}</strong> of{' '}
        <strong>{totalCount}</strong> orders
      </div>
    </>
  );
}

export default OrdersFilters;
