function CustomersStats({ customers }) {
  const totalCustomers = customers.length;

  const customersWithOrders = customers.filter(
    (customer) => customer.totalOrders > 0,
  ).length;

  const totalOrders = customers.reduce(
    (total, customer) => total + (customer.totalOrders || 0),
    0,
  );

  const totalPaidAmount = customers.reduce(
    (total, customer) => total + (customer.totalSpent || 0),
    0,
  );

  return (
    <div className="admin-customers-stats">
      <div className="admin-customer-stat-card">
        <span>Total Customers</span>
        <strong>{totalCustomers}</strong>
      </div>

      <div className="admin-customer-stat-card">
        <span>Customers With Orders</span>
        <strong>{customersWithOrders}</strong>
      </div>

      <div className="admin-customer-stat-card">
        <span>Total Orders</span>
        <strong>{totalOrders}</strong>
      </div>

      <div className="admin-customer-stat-card">
        <span>Total Paid Amount</span>
        <strong>₹{totalPaidAmount.toLocaleString('en-IN')}</strong>
      </div>
    </div>
  );
}

export default CustomersStats;
