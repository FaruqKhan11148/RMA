const API_URL = 'https://rma-backend-bo4a.onrender.com/';

export const fetchDailyRewardProgress = async (ownerId) => {
  const response = await fetch(
    `${API_URL}api/orders/owner/${ownerId}/daily-reward`,
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch daily reward progress');
  }

  return data;
};
