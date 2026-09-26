const API_URL = 'https://rma-backend-bo4a.onrender.com/';

export const fetchPendingPartners = async () => {
  const response = await fetch(
    `${API_URL}api/admin/delivery-partners/pending`,
    {
      method: 'GET',
      credentials: 'include',
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch delivery partners');
  }

  return data.deliveryPartners || [];
};

export const approvePartner = async (partnerId) => {
  const response = await fetch(`${API_URL}api/admin/rma/${partnerId}/approve`, {
    method: 'PATCH',
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to approve delivery partner');
  }

  return data;
};

export const rejectPartner = async (partnerId) => {
  const response = await fetch(`${API_URL}api/admin/rma/${partnerId}/reject`, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      rejectionReason: 'Application did not meet our criteria',
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to reject delivery partner');
  }

  return data;
};
