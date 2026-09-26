const API_URL = 'https://rma-backend-bo4a.onrender.com/';

export const fetchOwnerOrders = async (ownerId) => {
  const response = await fetch(`${API_URL}api/orders/owner/${ownerId}`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to load orders');
  }

  return data;
};

export const fetchOwnerProfile = async (token) => {
  const response = await fetch(`${API_URL}api/owners/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    return null;
  }

  return data.owner;
};

export const rejectOrderApi = async ({
  orderId,
  rejectionReason,
  rejectionDescription,
}) => {
  const response = await fetch(`${API_URL}api/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      status: 'Rejected',
      rejectionReason,
      rejectionDescription: rejectionDescription.trim() || null,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to reject order');
  }

  return data;
};

export const updateOrderStatusApi = async (orderId, status) => {
  const response = await fetch(`${API_URL}api/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      status,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to update order');
  }

  return data;
};
