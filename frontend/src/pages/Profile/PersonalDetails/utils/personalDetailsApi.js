const API_URL = 'https://rma-backend-bo4a.onrender.com/';

export const fetchCustomerDetails = async () => {
  const response = await fetch(`${API_URL}api/customers/me`, {
    credentials: 'include',
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();

  return data.customer;
};

export const updateCustomerDetails = async (name) => {
  const response = await fetch(`${API_URL}api/customers/me`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      name: name.trim(),
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to update profile');
  }

  return data.customer;
};
