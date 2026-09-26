export async function fetchAdminOrders() {
  const response = await fetch(
    'https://rma-backend-bo4a.onrender.com/api/admin/orders',
    {
      method: 'GET',
      credentials: 'include',
    },
  );

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
