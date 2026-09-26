const API_URL = 'https://rma-backend-bo4a.onrender.com/';

export const fetchOrderForReview = async (orderId) => {
  const response = await fetch(`${API_URL}api/orders/${orderId}`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Unable to load order');
  }

  return data.order;
};

export const submitOrderReview = async ({
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

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Unable to submit review');
  }

  return data;
};
