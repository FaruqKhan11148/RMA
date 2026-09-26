const API_URL = 'https://rma-backend-bo4a.onrender.com/';

export const requestDeliveryOtp = async (phone) => {
  const response = await fetch(`${API_URL}api/delivery/rma/request-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      phone,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Unable to send OTP');
  }

  return data;
};

export const verifyDeliveryOtp = async (phone, otp) => {
  const response = await fetch(`${API_URL}api/delivery/rma/verify-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
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
