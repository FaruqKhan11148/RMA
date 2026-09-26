export const getPartnerName = (deliveryPartner) => {
  return (
    deliveryPartner?.name ||
    deliveryPartner?.fullName ||
    deliveryPartner?.ownerName ||
    'Delivery Partner'
  );
};

export const calculateTodayEarnings = (orders = []) => {
  return orders.reduce(
    (total, order) => total + Number(order.deliveryRiderAmount || 0),
    0,
  );
};

export const formatAmount = (amount) => {
  return `₹${Number(amount || 0).toFixed(2)}`;
};
