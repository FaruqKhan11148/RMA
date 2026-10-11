const API_URL =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/'
    : 'https://rma-backend-bo4a.onrender.com/';

export const fetchDeliveryEarningHistory = async (token) => {
  const response = await fetch(`${API_URL}api/delivery/wallet/earnings`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to load earning history');
  }

  return data;
};
