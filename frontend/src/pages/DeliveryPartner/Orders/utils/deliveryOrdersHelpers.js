export const getStoredDeliveryPerson = () => {
  try {
    const storedDeliveryPerson = sessionStorage.getItem('delivery_person');

    return storedDeliveryPerson ? JSON.parse(storedDeliveryPerson) : null;
  } catch (error) {
    console.error('Failed to restore delivery person:', error);

    return null;
  }
};

export const getInitialLoginStep = () => {
  const token = sessionStorage.getItem('delivery_token');

  const storedDeliveryPerson = sessionStorage.getItem('delivery_person');

  return token && storedDeliveryPerson ? 'dashboard' : 'login';
};

export const getActiveOrders = (dashboardStats, activeSection) => {
  if (activeSection === 'today') {
    return dashboardStats?.orders?.today || [];
  }

  if (activeSection === 'pending') {
    return dashboardStats?.orders?.pending || [];
  }

  if (activeSection === 'completedToday') {
    return dashboardStats?.orders?.completedToday || [];
  }

  return dashboardStats?.orders?.allDelivered || [];
};
