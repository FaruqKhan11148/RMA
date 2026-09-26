const API_URL = 'https://rma-backend-bo4a.onrender.com/';

export const fetchEarnings = async (token) => {
  const response = await fetch(`${API_URL}api/delivery/earnings`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to load earnings');
  }

  return data;
};
