const API_URL = 'https://rma-backend-bo4a.onrender.com/';

const parseResponse = async (response) => {
  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || 'Request failed');

    error.status = response.status;

    throw error;
  }

  return data;
};

export const fetchOrderById = async (orderId) => {
  const response = await fetch(`${API_URL}api/orders/${orderId}`);

  return parseResponse(response);
};

export const cancelOrder = async (orderId, reason) => {
  const response = await fetch(`${API_URL}api/orders/${orderId}/cancel`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      reason,
    }),
  });

  return parseResponse(response);
};

export const rejectDelivery = async (orderId, reason, description) => {
  const response = await fetch(
    `${API_URL}api/orders/${orderId}/reject-delivery`,
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reason,
        description,
      }),
    },
  );

  return parseResponse(response);
};

export const submitReview = async ({
  orderId,
  rmaRating,
  shopRating,
  deliveryRating,
  feedback,
}) => {
  const response = await fetch(`${API_URL}api/reviews`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      orderId,
      rmaRating,
      shopRating,
      deliveryRating,
      feedback,
    }),
  });

  return parseResponse(response);
};
