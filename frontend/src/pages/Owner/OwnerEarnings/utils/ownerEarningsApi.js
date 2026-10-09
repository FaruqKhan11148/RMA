const API_URL = 'https://rma-backend-bo4a.onrender.com/';

const getOwnerToken = () => {
  return localStorage.getItem('rma_owner_token');
};

const ownerRequest = async (path, options = {}) => {
  const token = getOwnerToken();

  if (!token) {
    throw new Error('Owner session token not found. Please log in again.');
  }

  const response = await fetch(`${API_URL.replace(/\/+$/, '')}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Owner request failed');
  }

  return data;
};

export const fetchOwnerEarnings = async (ownerId) => {
  return ownerRequest(
    `/api/orders/owner/${encodeURIComponent(ownerId)}/earnings`,
  );
};

export const archiveOwnerEarnings = async (ownerId, orderIds) => {
  return ownerRequest(
    `/api/orders/owner/${encodeURIComponent(ownerId)}/earnings/archive`,
    {
      method: 'POST',
      body: JSON.stringify({ orderIds }),
    },
  );
};
