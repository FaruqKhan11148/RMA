const API_URL = 'https://rma-backend-bo4a.onrender.com/';

export const fetchSavedAddresses = async () => {
  const response = await fetch(`${API_URL}api/customers/addresses`, {
    credentials: 'include',
  });

  if (response.status === 401) {
    return [];
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch saved addresses');
  }

  return data.addresses || [];
};

export const fetchDeliveryPreview = async (ownerId, deliveryLocation) => {
  const response = await fetch(`${API_URL}api/orders/delivery-preview`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ownerId,
      deliveryLocation: {
        latitude: Number(deliveryLocation.latitude),
        longitude: Number(deliveryLocation.longitude),
      },
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Unable to calculate delivery charge');
  }

  return data;
};

export const createPayuPayment = async (orderId) => {
  const response = await fetch(`${API_URL}api/payments/create-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      orderId,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Unable to create PayU payment.');
  }

  return data;
};
