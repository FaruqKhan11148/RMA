function CustomersTable({
  customers,
  onViewCustomer,
  customerDetailsLoading,
  formatDate,
}) {
  if (customers.length === 0) {
    return (
      <div className="admin-customers-table-wrapper">
        <table className="admin-customers-table">
          <tbody>
            <tr>
              <td colSpan="9" className="admin-customers-empty">
                No customers found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="admin-customers-table-wrapper">
      <table className="admin-customers-table">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Phone</th>
            <th>Location</th>
            <th>Orders</th>
            <th>Completed</th>
            <th>Total Spent</th>
            <th>Last Order</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {customers.map((customer) => (
            <tr key={customer.phone}>
              <td>
                <div className="admin-customer-name">
                  {customer.name || 'Unknown'}
                </div>
              </td>

              <td>{customer.phone}</td>

              <td>
                <div className="admin-customer-location">
                  {customer.deliveryLocation?.address ||
                    customer.address ||
                    '-'}
                </div>
              </td>

              <td>{customer.totalOrders || 0}</td>

              <td>{customer.completedOrders || 0}</td>

              <td>
                ₹{Number(customer.totalSpent || 0).toLocaleString('en-IN')}
              </td>

              <td>{formatDate(customer.lastOrderAt)}</td>

              <td>
                <span
                  className={`customer-status ${
                    customer.latestStatus
                      ? `status-${customer.latestStatus
                          .toLowerCase()
                          .replace(/\s+/g, '-')}`
                      : ''
                  }`}
                >
                  {customer.latestStatus || 'No Orders'}
                </span>
              </td>

              <td>
                <button
                  className="admin-customer-view-btn"
                  onClick={() => onViewCustomer(customer.phone)}
                  disabled={customerDetailsLoading}
                >
                  {customerDetailsLoading ? 'Loading...' : 'View'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CustomersTable;
