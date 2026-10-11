const API_URL =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/'
    : 'https://rma-backend-bo4a.onrender.com/';

async function registerOwner(ownerData) {
  const response = await fetch(`${API_URL}api/owners/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(ownerData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Owner registration failed');
  }

  return data;
}

export default registerOwner;
