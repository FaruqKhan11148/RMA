export const formatAmount = (amount) => {
  return `₹${Number(amount || 0).toFixed(2)}`;
};

export const formatEarningDate = (date) => {
  if (!date) {
    return '—';
  }

  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};
