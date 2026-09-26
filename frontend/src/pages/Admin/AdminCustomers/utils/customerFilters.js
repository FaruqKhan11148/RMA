export function filterCustomers(customers, search) {
  const value = search.trim().toLowerCase();

  if (!value) {
    return customers;
  }

  return customers.filter((customer) => {
    return (
      customer.name?.toLowerCase().includes(value) ||
      customer.phone?.toLowerCase().includes(value) ||
      customer.address?.toLowerCase().includes(value) ||
      customer.deliveryLocation?.address?.toLowerCase().includes(value)
    );
  });
}
