const API_URL = 'https://rma-backend-bo4a.onrender.com/';

export const fetchNotifications = async () => {
  let endpoint = `${API_URL}api/orders/notifications/customer`;
  const headers = {};

  const ownerToken = localStorage.getItem('rma_owner_token');
  const ownerData = localStorage.getItem('rma_owner');

  const deliveryToken = sessionStorage.getItem('delivery_token');
  const deliveryData = sessionStorage.getItem('delivery_person');

  if (ownerToken && ownerData) {
    endpoint = `${API_URL}api/orders/notifications/owner`;
    headers.Authorization = `Bearer ${ownerToken}`;
  } else if (deliveryToken && deliveryData) {
    endpoint = `${API_URL}api/orders/notifications/delivery`;
    headers.Authorization = `Bearer ${deliveryToken}`;
  }

  const response = await fetch(endpoint, {
    credentials: 'include',
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Unable to fetch notifications');
  }

  return {
    notifications: data.notifications || [],
    unreadCount: data.unreadCount || 0,
  };
};

export const markNotificationAsRead = async (notificationId) => {
  let endpoint = `${API_URL}api/orders/notifications/customer/${notificationId}/read`;
  const headers = {};

  const ownerToken = localStorage.getItem('rma_owner_token');
  const ownerData = localStorage.getItem('rma_owner');

  const deliveryToken = sessionStorage.getItem('delivery_token');
  const deliveryData = sessionStorage.getItem('delivery_person');

  if (ownerToken && ownerData) {
    endpoint = `${API_URL}api/orders/notifications/owner/${notificationId}/read`;
    headers.Authorization = `Bearer ${ownerToken}`;
  } else if (deliveryToken && deliveryData) {
    endpoint = `${API_URL}api/orders/notifications/delivery/${notificationId}/read`;
    headers.Authorization = `Bearer ${deliveryToken}`;
  }

  const response = await fetch(endpoint, {
    method: 'PATCH',
    credentials: 'include',
    headers,
  });

  if (!response.ok) {
    const data = await response.json();

    console.error(
      'Failed to mark notification as read:',
      data.message || 'Unknown error',
    );

    return false;
  }

  return true;
};
