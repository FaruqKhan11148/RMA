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

export const fetchPartnerApplication = async (partnerId) => {
  const response = await fetch(
    `${API_URL}api/admin/delivery-partners/${partnerId}`,
    {
      method: 'GET',
      credentials: 'include',
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || 'Failed to fetch delivery partner application',
    );
  }

  return data.deliveryPartner;
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

export const verifyPartnerKyc = async (partnerId) => {
  const response = await fetch(
    `${API_URL}api/admin/delivery-partners/${partnerId}/kyc/verify`,
    {
      method: 'PATCH',
      credentials: 'include',
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to verify KYC');
  }

  return data;
};

export const rejectPartnerKyc = async (partnerId, rejectionReason) => {
  const response = await fetch(
    `${API_URL}api/admin/delivery-partners/${partnerId}/kyc/reject`,
    {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rejectionReason,
      }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to reject KYC');
  }

  return data;
};

export const verifyPartnerDrivingLicence = async (partnerId) => {
  const response = await fetch(
    `${API_URL}api/admin/delivery-partners/${partnerId}/driving-licence/verify`,
    {
      method: 'PATCH',
      credentials: 'include',
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to verify driving licence');
  }

  return data;
};

export const rejectPartnerDrivingLicence = async (
  partnerId,
  rejectionReason,
) => {
  const response = await fetch(
    `${API_URL}api/admin/delivery-partners/${partnerId}/driving-licence/reject`,
    {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rejectionReason,
      }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to reject driving licence');
  }

  return data;
};

export const verifyPartnerVehicle = async (partnerId) => {
  const response = await fetch(
    `${API_URL}api/admin/delivery-partners/${partnerId}/vehicle/verify`,
    {
      method: 'PATCH',
      credentials: 'include',
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to verify vehicle');
  }

  return data;
};

export const rejectPartnerVehicle = async (partnerId, rejectionReason) => {
  const response = await fetch(
    `${API_URL}api/admin/delivery-partners/${partnerId}/vehicle/reject`,
    {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rejectionReason,
      }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to reject vehicle');
  }

  return data;
};

export const verifyPartnerBank = async (partnerId) => {
  const response = await fetch(
    `${API_URL}api/admin/delivery-partners/${partnerId}/bank/verify`,
    {
      method: 'PATCH',
      credentials: 'include',
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to verify bank account');
  }

  return data;
};

export const rejectPartnerBank = async (partnerId, rejectionReason) => {
  const response = await fetch(
    `${API_URL}api/admin/delivery-partners/${partnerId}/bank/reject`,
    {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rejectionReason,
      }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to reject bank account');
  }

  return data;
};

export const fetchAllRmaDeliveryPartners = async () => {
  const response = await fetch(`${API_URL}api/admin/delivery-partners/all`, {
    method: 'GET',
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch delivery partners');
  }

  return data.deliveryPartners || [];
};
