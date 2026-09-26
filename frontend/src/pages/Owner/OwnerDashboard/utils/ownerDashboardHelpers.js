export const getTodayOrders = (orders) => {
  return orders.filter((order) => {
    const orderDate = new Date(order.createdAt);
    const today = new Date();

    return (
      orderDate.getDate() === today.getDate() &&
      orderDate.getMonth() === today.getMonth() &&
      orderDate.getFullYear() === today.getFullYear()
    );
  });
};

export const getPendingOrders = (orders) => {
  return orders.filter((order) => order.status === 'Pending');
};

export const getCompletedOrders = (orders) => {
  return orders.filter((order) => order.status === 'Completed');
};

export const getTotalRevenue = (completedOrders) => {
  return completedOrders.reduce((total, order) => total + order.totalPrice, 0);
};
