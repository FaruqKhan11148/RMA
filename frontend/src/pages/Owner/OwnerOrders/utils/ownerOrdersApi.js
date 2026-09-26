const API_URL = 'https://rma-backend-bo4a.onrender.com/';

export const fetchOwnerOrders = async (ownerId) => {
  const response = await fetch(`${API_URL}api/orders/owner/${ownerId}`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to load orders');
  }

  return data;
};

export const updateOwnerOrderStatus = async (
  orderId,
  status,
  extraData = {},
) => {
  const response = await fetch(`${API_URL}api/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      status,
      ...extraData,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to update order');
  }

  return data;
};

export const fetchDeliveryPartners = async (orderId, ownerToken) => {
  const response = await fetch(
    `${API_URL}api/delivery/owner/available-partners/${orderId}`,
    {
      headers: {
        Authorization: `Bearer ${ownerToken}`,
      },
      credentials: 'include',
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to load delivery partners');
  }

  return data;
};
