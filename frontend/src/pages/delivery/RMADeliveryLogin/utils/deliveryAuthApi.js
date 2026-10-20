const API_URL =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/'
    : 'https://rma-backend-bo4a.onrender.com/';

// SHOP DELIVERY PARTNER OTP LOGIN
export const requestDeliveryOtp = async (shopId, phone) => {
  const response = await fetch(`${API_URL}api/delivery/request-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      shopId,
      phone,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Unable to send OTP');
  }

  return data;
};

export const verifyDeliveryOtp = async (shopId, phone, otp) => {
  const response = await fetch(`${API_URL}api/delivery/verify-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      shopId,
      phone,
      otp,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Invalid OTP');
  }

  return data;
};

// RMA DELIVERY PARTNER PASSWORD LOGIN
export const loginRmaDeliveryPartner = async (phone, password) => {
  const response = await fetch(`${API_URL}api/delivery/rma/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      phone,
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || 'Unable to log in');

    error.code = data.code;
    error.retryAfterSeconds = Number(data.retryAfterSeconds) || 0;

    throw error;
  }

  return data;
};
