export const fetchSavedAddresses = async () => {
  const response = await fetch(
    'https://rma-backend-bo4a.onrender.com/api/customers/addresses',
    {
      credentials: 'include',
    },
  );

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
    `https://rma-backend-bo4a.onrender.com/api/owners/nearby?latitude=${latitude}&longitude=${longitude}`,
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch nearby shops');
  }

  return data.shops || [];
};

export const checkCustomerLogin = async () => {
  const response = await fetch(
    'https://rma-backend-bo4a.onrender.com/api/customers/me',
    {
      credentials: 'include',
    },
  );

  if (!response.ok) {
    return null;
  }

  const data = await response.json();

  return data.customer || null;
};
