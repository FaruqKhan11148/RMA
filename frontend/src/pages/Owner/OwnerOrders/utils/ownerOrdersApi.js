const API_URL =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/'
    : 'https://rma-backend-bo4a.onrender.com/';

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
  const ownerToken = localStorage.getItem('rma_owner_token');

  const response = await fetch(`${API_URL}api/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(ownerToken ? { Authorization: `Bearer ${ownerToken}` } : {}),
    },
    credentials: 'include',
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

export const startRmaDispatch = async (orderId, ownerToken) => {
  const response = await fetch(`${API_URL}api/orders/${orderId}/rma-dispatch`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ownerToken}`,
    },
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || 'Failed to start RMA delivery');

    error.status = response.status;
    error.code = data.code;

    throw error;
  }

  return data;
};

export const confirmDirectUpiPayment = async (orderId, reference = '') => {
  const ownerToken = localStorage.getItem('rma_owner_token');

  const response = await fetch(
    `${API_URL}api/orders/${orderId}/confirm-direct-upi`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(ownerToken ? { Authorization: `Bearer ${ownerToken}` } : {}),
      },
      credentials: 'include',
      body: JSON.stringify({ reference }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || 'Failed to confirm UPI payment');
    error.status = response.status;
    throw error;
  }

  return data;
};
