const API_URL =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/'
    : 'https://rma-backend-bo4a.onrender.com/';

export async function fetchCustomers() {
  const response = await fetch(`${API_URL}api/admin/customers`, {
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
    `${API_URL}api/admin/customers/${encodeURIComponent(phone)}`,
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
