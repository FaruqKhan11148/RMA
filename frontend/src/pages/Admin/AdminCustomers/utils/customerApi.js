export async function fetchCustomers() {
  const response = await fetch(
    'https://rma-backend-bo4a.onrender.com/api/admin/customers',
    {
      credentials: 'include',
    },
  );

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
    `https://rma-backend-bo4a.onrender.com/api/admin/customers/${encodeURIComponent(phone)}`,
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
