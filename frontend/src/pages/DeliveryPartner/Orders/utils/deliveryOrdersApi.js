const API_URL = 'https://rma-backend-bo4a.onrender.com/';

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

export const verifyDeliveryLoginOtp = async (shopId, phone, otp) => {
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

export const fetchDeliveryDashboard = async (token) => {
  const response = await fetch(`${API_URL}api/delivery/dashboard`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to load dashboard statistics');
  }

  return data;
};

export const verifyCustomerDeliveryOtp = async (token, orderId, otp) => {
  const response = await fetch(`${API_URL}api/orders/${orderId}/verify-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      otp,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Invalid OTP');
  }

  return data;
};

export const fetchDeliveryRoute = async (token, orderId) => {
  const response = await fetch(`${API_URL}api/delivery/route/${orderId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to load route');
  }

  return data;
};

export const fetchPendingDeliveryAssignments = async (token) => {
  const response = await fetch(`${API_URL}api/delivery/assignments/pending`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to load delivery assignments');
  }

  return data;
};

export const acceptDeliveryAssignment = async (token, orderId) => {
  const response = await fetch(
    `${API_URL}api/delivery/assignments/${orderId}/accept`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to accept delivery assignment');
  }

  return data;
};

export const rejectDeliveryAssignment = async (token, orderId) => {
  const response = await fetch(
    `${API_URL}api/delivery/assignments/${orderId}/reject`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to reject delivery assignment');
  }

  return data;
};

export const collectDeliveryOrder = async (token, orderId) => {
  const response = await fetch(
    `${API_URL}api/delivery/orders/${orderId}/collect`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to collect delivery order');
  }

  return data;
};
