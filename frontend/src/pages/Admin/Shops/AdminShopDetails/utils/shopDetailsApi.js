const API_URL = 'https://rma-backend-bo4a.onrender.com/';

export const fetchShopStats = async (shopId) => {
  const response = await fetch(`${API_URL}api/admin/owners/stats/${shopId}`, {
    method: 'GET',
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch shop statistics');
  }

  return data;
};
