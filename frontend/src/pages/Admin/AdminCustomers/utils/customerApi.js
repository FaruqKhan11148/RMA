export async function fetchCustomers() {
  const response = await fetch('http://localhost:5000/api/admin/customers', {
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || 'Failed to fetch customers');

    error.status = response.status;

    throw error;
  }

  return data.customers || [];
}

export async function fetchCustomerDetails(phone) {
  const response = await fetch(
    `http://localhost:5000/api/admin/customers/${encodeURIComponent(phone)}`,
    {
      credentials: 'include',
    },
  );

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || 'Failed to fetch customer details');

    error.status = response.status;

    throw error;
  }

  return {
    customer: data.customer,
    stats: data.stats || {},
    orders: data.orders || [],
  };
}
