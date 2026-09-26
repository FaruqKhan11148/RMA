export const formatAmount = (amount) => {
  return `₹${Number(amount || 0).toFixed(2)}`;
};

export const formatDate = (date) => {
  if (!date) {
    return '—';
  }

  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatTime = (date) => {
  if (!date) {
    return '';
  }

  return new Date(date).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getItemCount = (order) => {
  return (
    order.totalItems ||
    order.items?.reduce(
      (total, item) => total + Number(item.quantity || 0),
      0,
    ) ||
    order.items?.length ||
    0
  );
};
