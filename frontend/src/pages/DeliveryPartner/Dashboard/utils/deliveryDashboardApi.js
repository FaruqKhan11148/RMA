const API_URL = 'https://rma-backend-bo4a.onrender.com/';

export const fetchDeliveryDashboard = async (token) => {
  const response = await fetch(`${API_URL}api/delivery/dashboard`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to load dashboard');
  }

  return data;
};
