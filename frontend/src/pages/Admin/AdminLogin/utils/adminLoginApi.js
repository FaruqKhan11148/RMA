export async function loginAdmin(username, password) {
  const response = await fetch(
    'https://rma-backend-bo4a.onrender.com/api/admin/login',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        username,
        password,
      }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || 'Admin login failed');

    error.status = response.status;

    throw error;
  }

  return data;
}
