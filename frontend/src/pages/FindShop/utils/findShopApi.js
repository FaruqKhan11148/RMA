const API_URL = 'https://rma-backend-bo4a.onrender.com/';

export const fetchSavedShop = async (shopId) => {
  const response = await fetch(`${API_URL}api/owners/shop/${shopId}`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to load shop');
  }

  return data;
};

export const fetchNearbyShops = async (latitude, longitude) => {
  const response = await fetch(
    `${API_URL}api/owners/nearby?latitude=${latitude}&longitude=${longitude}`,
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch nearby shops');
  }

  return data;
};

export const fetchSavedAddresses = async () => {
  const response = await fetch(`${API_URL}api/customers/addresses`, {
    credentials: 'include',
  });

  const data = await response.json();

  if (response.status === 401) {
    return {
      addresses: [],
    };
  }

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch saved addresses');
  }

  return data;
};

export const checkCustomerLogin = async () => {
  const response = await fetch(`${API_URL}api/customers/me`, {
    credentials: 'include',
  });

  return response.ok;
};
