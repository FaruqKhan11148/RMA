const API_URL =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/'
    : 'https://rma-backend-bo4a.onrender.com/';

export async function fetchAdminOrders() {
  const response = await fetch(`${API_URL}api/admin/orders`, {
    method: 'GET',
    credentials: 'include',
  });

  if (response.status === 401) {
    const error = new Error('Admin authentication required');

    error.status = 401;

    throw error;
  }

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || 'Failed to fetch orders');

    error.status = response.status;

    throw error;
  }

  return data.orders || [];
}

// ============================================================
// FETCH ELIGIBLE RMA DELIVERY PARTNERS
// ============================================================

export async function fetchEligibleRmaDeliveryPartners(orderId) {
  const response = await fetch(
    `${API_URL}api/admin/orders/${orderId}/rma-delivery-partners`,
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
    const error = new Error(
      data.message || 'Failed to fetch eligible RMA delivery partners',
    );

    error.status = response.status;

    throw error;
  }

  return data;
}

// ============================================================
// ASSIGN RMA DELIVERY PARTNER
// ============================================================

export async function assignRmaDeliveryPartner(orderId, deliveryPersonId) {
  const response = await fetch(
    `${API_URL}api/admin/orders/${orderId}/rma-delivery-partner`,
    {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        deliveryPersonId,
      }),
    },
  );

  if (response.status === 401) {
    const error = new Error('Admin authentication required');
    error.status = 401;
    throw error;
  }

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(
      data.message || 'Failed to assign RMA delivery partner',
    );

    error.status = response.status;

    throw error;
  }

  return data;
}

// ============================================================
// CONFIRM RMA COLLECTION PAYMENT (ADMIN ONLY)
// ============================================================

export async function confirmRmaCollectionPayment(orderId) {
  const response = await fetch(
    `${API_URL}api/admin/orders/${encodeURIComponent(orderId)}/rma-collection-payment/confirm`,
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
    const error = new Error(
      data.message || 'Failed to confirm RMA collection payment',
    );

    error.status = response.status;
    throw error;
  }

  return data;
}
