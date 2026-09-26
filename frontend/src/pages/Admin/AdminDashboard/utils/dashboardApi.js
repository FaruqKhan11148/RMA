export async function fetchAdminSession() {
  const response = await fetch(
    'https://rma-backend-bo4a.onrender.com/api/admin/me',
    {
      method: 'GET',
      credentials: 'include',
    },
  );

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || 'Failed to fetch admin session');

    error.status = response.status;

    throw error;
  }

  return data.admin;
}

export async function fetchDashboardData() {
  const response = await fetch(
    'https://rma-backend-bo4a.onrender.com/api/admin/dashboard',
    {
      method: 'GET',
      credentials: 'include',
    },
  );

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || 'Failed to load dashboard');

    error.status = response.status;

    throw error;
  }

  return {
    stats: data.stats,
    orderStatus: data.orderStatus,
  };
}

export async function logoutAdmin() {
  const response = await fetch(
    'https://rma-backend-bo4a.onrender.com/api/admin/logout',
    {
      method: 'POST',
      credentials: 'include',
    },
  );

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));

    const error = new Error(data.message || 'Failed to logout');

    error.status = response.status;

    throw error;
  }
}
