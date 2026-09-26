export async function fetchOwners() {
  const response = await fetch(
    'https://rma-backend-bo4a.onrender.com/api/admin/owners',
    {
      method: 'GET',
      credentials: 'include',
    },
  );

  if (response.status === 401) {
    const error = new Error('Admin authentication required');

    error.status = 401;

    throw error;
  }

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || 'Failed to fetch owners');

    error.status = response.status;

    throw error;
  }

  return data.owners || [];
}

export async function fetchSettlements() {
  const response = await fetch(
    'https://rma-backend-bo4a.onrender.com/api/admin/owners/settlements',
    {
      method: 'GET',
      credentials: 'include',
    },
  );

  if (response.status === 401) {
    const error = new Error('Admin authentication required');

    error.status = 401;

    throw error;
  }

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || 'Failed to fetch settlements');

    error.status = response.status;

    throw error;
  }

  return data.settlements || [];
}

export async function updateSettlement(ownerId, action) {
  const response = await fetch(
    `https://rma-backend-bo4a.onrender.com/api/admin/owners/${ownerId}/settlement/${action}`,
    {
      method: 'PATCH',
      credentials: 'include',
    },
  );

  if (response.status === 401) {
    const error = new Error('Admin authentication required');

    error.status = 401;

    throw error;
  }

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || `Failed to ${action} settlement`);

    error.status = response.status;

    throw error;
  }

  return data;
}

export async function startPayUOnboarding(ownerId) {
  const response = await fetch(
    `https://rma-backend-bo4a.onrender.com/api/admin/owners/${ownerId}/payu/onboarding/start`,
    {
      method: 'PATCH',
      credentials: 'include',
    },
  );

  if (response.status === 401) {
    const error = new Error('Admin authentication required');

    error.status = 401;

    throw error;
  }

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || 'Failed to start PayU onboarding');

    error.status = response.status;

    throw error;
  }

  return data;
}

export async function verifyPayU(ownerId, type) {
  let endpoint = '';

  if (type === 'bank') {
    endpoint = 'bank/verify';
  }

  if (type === 'kyc') {
    endpoint = 'kyc/verify';
  }

  if (type === 'complete') {
    endpoint = 'onboarding/complete';
  }

  const response = await fetch(
    `https://rma-backend-bo4a.onrender.com/api/admin/owners/${ownerId}/payu/${endpoint}`,
    {
      method: 'PATCH',
      credentials: 'include',
    },
  );

  if (response.status === 401) {
    const error = new Error('Admin authentication required');

    error.status = 401;

    throw error;
  }

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || 'PayU verification failed');

    error.status = response.status;

    throw error;
  }

  return data;
}
