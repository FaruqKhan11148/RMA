const API_URL = 'https://rma-backend-bo4a.onrender.com/';

export const fetchCustomerProfile = async () => {
  const response = await fetch(`${API_URL}api/customers/me`, {
    credentials: 'include',
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  return data.customer;
};

export const logoutCustomer = async () => {
  const response = await fetch(`${API_URL}api/customers/logout`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Logout failed');
  }

  return response;
};

export const logoutOwner = async () => {
  const token = localStorage.getItem('rma_owner_token');

  const response = await fetch(`${API_URL}api/owners/logout`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Owner logout failed');
  }

  return response;
};

export const logoutDeliveryPartner = async () => {
  const token = sessionStorage.getItem('delivery_token');

  const response = await fetch(`${API_URL}api/delivery/logout`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Delivery partner logout failed');
  }

  return response;
};

export const switchFromCustomer = async () => {
  return logoutCustomer();
};

export const switchFromOwner = async () => {
  return logoutOwner();
};

export const switchFromDeliveryPartner = async () => {
  return logoutDeliveryPartner();
};
