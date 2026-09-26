export const formatDate = (date) => {
  if (!date) return '—';

  return new Date(date).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

export const formatAmount = (amount) => {
  return `₹${Number(amount || 0).toFixed(2)}`;
};

export const getPaymentStatusClass = (status) => {
  switch (status) {
    case 'Paid':
      return 'payment-status-paid';

    case 'Failed':
      return 'payment-status-failed';

    case 'Refunded':
      return 'payment-status-refunded';

    case 'Pending':
    default:
      return 'payment-status-pending';
  }
};

export const getPaymentMethodLabel = (order) => {
  if (order.paymentMethod === 'ONLINE') {
    return order.onlinePaymentMethod
      ? `ONLINE • ${order.onlinePaymentMethod}`
      : 'ONLINE';
  }

  if (order.paymentMethod === 'COD') {
    return 'COD';
  }

  return order.paymentMethod || '—';
};
