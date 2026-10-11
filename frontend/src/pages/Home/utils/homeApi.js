const API_URL =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/'
    : 'https://rma-backend-bo4a.onrender.com/';

export const fetchSavedAddresses = async () => {
  const response = await fetch(`${API_URL}api/customers/addresses`, {
    credentials: 'include',
  });

  const data = await response.json();

  if (response.status === 401) {
    return [];
  }

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch saved addresses');
  }

  return data.addresses || [];
};

export const fetchNearbyShops = async (latitude, longitude) => {
  const response = await fetch(
    `${API_URL}api/owners/nearby?latitude=${latitude}&longitude=${longitude}`,
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch nearby shops');
  }

  return data.shops || [];
};

export const checkCustomerLogin = async () => {
  const response = await fetch(`${API_URL}api/customers/me`, {
    credentials: 'include',
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();

  return data.customer || null;
};
