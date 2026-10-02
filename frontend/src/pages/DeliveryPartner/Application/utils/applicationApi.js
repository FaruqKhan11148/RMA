const API_BASE_URL = 'https://rma-backend-bo4a.onrender.com/api';

const getToken = () => {
  return localStorage.getItem('delivery_token');
};

const getHeaders = () => {
  const token = getToken();

  if (!token) {
    throw new Error('RMA delivery login session not found.');
  }

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

export const updateRmaApplication = async (section, data) => {
  const response = await fetch(`${API_BASE_URL}/delivery/rma/application`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({
      section,
      data,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Unable to save your application.');
  }

  return result;
};

export const fetchRmaApplication = async () => {
  const response = await fetch(`${API_BASE_URL}/delivery/rma/application`, {
    method: 'GET',
    headers: getHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Unable to load your application.');
  }

  return data.application;
};

export const submitRmaApplication = async () => {
  const response = await fetch(
    `${API_BASE_URL}/delivery/rma/application/submit`,
    {
      method: 'PATCH',
      headers: getHeaders(),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(
      data.message || 'Unable to submit your application.',
    );

    error.missingFields = data.missingFields || [];

    throw error;
  }

  return data;
};
