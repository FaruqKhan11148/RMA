const API_URL = 'https://rma-backend-bo4a.onrender.com/';

export const fetchDeliveryWallet = async (token) => {
  const response = await fetch(`${API_URL}api/delivery/wallet`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to load wallet');
  }

  return data;
};

export const requestDeliveryWithdrawal = async (token, amount) => {
  const response = await fetch(`${API_URL}api/delivery/wallet/withdraw`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      amount,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(
      data.message || 'Failed to submit withdrawal request',
    );

    error.availableBalance = data.availableBalance;

    throw error;
  }

  return data;
};
