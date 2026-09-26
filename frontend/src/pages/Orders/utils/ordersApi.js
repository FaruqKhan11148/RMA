const API_URL = 'https://rma-backend-bo4a.onrender.com/';

export const fetchCustomerOrders = async () => {
  const meResponse = await fetch(`${API_URL}api/customers/me`, {
    credentials: 'include',
  });

  console.log('[Orders] /customers/me status:', meResponse.status);
  console.log('[Orders] /customers/me ok:', meResponse.ok);

  if (!meResponse.ok) {
    return null;
  }

  console.log('[Orders] Customer is logged in');
  console.log('[Orders] Calling /api/customers/orders');

  const ordersResponse = await fetch(`${API_URL}api/customers/orders`, {
    credentials: 'include',
  });

  console.log('[Orders] /api/customers/orders status:', ordersResponse.status);

  const data = await ordersResponse.json();

  console.log('[Orders] Customer orders response:', data);

  if (!ordersResponse.ok) {
    throw new Error(data.message || 'Failed to load customer orders');
  }

  console.log('[Orders] Setting customer orders:', data.orders?.length);

  return data.orders || [];
};
