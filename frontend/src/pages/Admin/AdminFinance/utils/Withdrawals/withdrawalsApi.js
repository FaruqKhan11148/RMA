const API_URL =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/'
    : 'https://rma-backend-bo4a.onrender.com/';

export async function fetchFinanceWithdrawals({
  status = '',
  page = 1,
  limit = 20,
} = {}) {
  const params = new URLSearchParams();

  if (status) {
    params.set('status', status);
  }

  params.set('page', page);
  params.set('limit', limit);

  const response = await fetch(
    `${API_URL}api/admin/finance/withdrawals?${params.toString()}`,
    {
      method: 'GET',
      credentials: 'include',
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch withdrawals');
  }

  return data;
}

export async function completeFinanceWithdrawal(transactionId) {
  const response = await fetch(
    `${API_URL}api/admin/finance/withdrawals/${transactionId}/complete`,
    {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to complete withdrawal');
  }

  return data;
}

export async function rejectFinanceWithdrawal(transactionId) {
  const response = await fetch(
    `${API_URL}api/admin/finance/withdrawals/${transactionId}/reject`,
    {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to reject withdrawal');
  }

  return data;
}
