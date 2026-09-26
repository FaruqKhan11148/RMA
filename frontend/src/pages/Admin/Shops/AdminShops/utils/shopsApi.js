const API_URL = 'https://rma-backend-bo4a.onrender.com/';

export const fetchShops = async () => {
  const response = await fetch(`${API_URL}api/admin/owners`, {
    method: 'GET',
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch shops');
  }

  return data.owners || [];
};
