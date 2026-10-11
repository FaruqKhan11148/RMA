const API_URL =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/'
    : 'https://rma-backend-bo4a.onrender.com/';

export async function fetchAdminOrders() {
  const response = await fetch(`${API_URL}api/admin/orders`, {
    method: 'GET',
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || 'Failed to fetch order');

    error.status = response.status;

    throw error;
  }

  return data.orders || [];
}

export function findOrderById(orders, orderId) {
  return orders.find((item) => item.orderId === orderId);
}
