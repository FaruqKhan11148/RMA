const API_URL = 'http://localhost:5000/';

export const fetchDeliveryHistory = async (token) => {
  const response = await fetch(`${API_URL}api/delivery/dashboard`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to load delivery history');
  }

  return data;
};
