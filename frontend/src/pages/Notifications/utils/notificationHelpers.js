export const getNotificationStatus = (type) => {
  const statusMap = {
    ORDER_ACCEPTED: 'Accepted',
    ORDER_OUT_FOR_DELIVERY: 'Out for Delivery',
    ORDER_COMPLETED: 'Completed',
    ORDER_REJECTED: 'Rejected',
    ORDER_CANCELLED: 'Cancelled',
    NEW_ORDER: 'New Order',
    DELIVERY_ASSIGNED: 'Delivery Assigned',
  };

  return statusMap[type] || 'Notification';
};

export const formatDate = (date) => {
  return new Date(date).toLocaleString();
};
