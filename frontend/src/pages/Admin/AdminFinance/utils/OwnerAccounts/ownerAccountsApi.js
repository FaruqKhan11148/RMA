const API_URL =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/'
    : 'https://rma-backend-bo4a.onrender.com/';

export async function fetchOwnerAccounts() {
  const response = await fetch(`${API_URL}api/admin/finance/owner-accounts`, {
    method: 'GET',
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || 'Failed to fetch owner accounts');

    error.status = response.status;

    throw error;
  }

  return data;
}
