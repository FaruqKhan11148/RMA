export async function fetchDeliveryPersons() {
  const response = await fetch(
    'https://rma-backend-bo4a.onrender.com/api/admin/delivery',
    {
      method: 'GET',
      credentials: 'include',
    },
  );

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || 'Failed to fetch delivery persons');

    error.status = response.status;

    throw error;
  }

  return data.deliveryPersons || [];
}

export async function fetchDeliveryPersonDetails(shopId) {
  const response = await fetch(
    `https://rma-backend-bo4a.onrender.com/api/admin/delivery/${shopId}`,
    {
      method: 'GET',
      credentials: 'include',
    },
  );

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(
      data.message || 'Failed to fetch delivery person details',
    );

    error.status = response.status;

    throw error;
  }

  return data.deliveryPerson;
}
