const API_URL =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/'
    : 'https://rma-backend-bo4a.onrender.com/';

export async function fetchDeliveryPersons() {
  const response = await fetch(`${API_URL}api/admin/delivery`, {
    method: 'GET',
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || 'Failed to fetch delivery persons');

    error.status = response.status;

    throw error;
  }

  return data.deliveryPersons || [];
}

export async function fetchDeliveryPersonDetails(deliveryPersonId) {
  const response = await fetch(
    `${API_URL}api/admin/delivery/${deliveryPersonId}`,
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
