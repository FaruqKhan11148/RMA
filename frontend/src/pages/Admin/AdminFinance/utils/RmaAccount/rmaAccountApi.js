const API_BASE_URL = 'https://rma-backend-bo4a.onrender.com/';

export async function fetchRmaAccount() {
  const response = await fetch(`${API_BASE_URL}api/admin/finance/rma-account`, {
    method: 'GET',
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || 'Failed to fetch RMA account');

    error.status = response.status;

    throw error;
  }

  return data;
}

export async function setupRmaAccount() {
  const response = await fetch(
    `${API_BASE_URL}api/admin/finance/rma-account/setup`,
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || 'Failed to setup RMA account');

    error.status = response.status;

    throw error;
  }

  return data;
}
