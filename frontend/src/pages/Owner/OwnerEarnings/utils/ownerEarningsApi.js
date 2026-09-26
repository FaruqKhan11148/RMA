const API_URL = 'https://rma-backend-bo4a.onrender.com/';

export const fetchOwnerEarnings = async (ownerId) => {
  const response = await fetch(
    `${API_URL}api/orders/owner/${ownerId}/earnings`,
    {
      credentials: 'include',
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch earnings');
  }

  return data;
};
