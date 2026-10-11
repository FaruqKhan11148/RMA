const API_URL =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/'
    : 'https://rma-backend-bo4a.onrender.com/';

export async function fetchDailyOrders() {
  const response = await fetch(`${API_URL}api/admin/orders/daily`, {
    method: 'GET',
    credentials: 'include',
  });

  if (response.status === 401) {
    const error = new Error('Admin authentication required');

    error.status = 401;

    throw error;
  }

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || 'Failed to fetch daily orders');

    error.status = response.status;

    throw error;
  }

  return data;
}
