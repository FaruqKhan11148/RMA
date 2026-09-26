export function formatCurrency(amount) {
  return `₹${Number(amount || 0).toFixed(2)}`;
}

export function formatDateTime(date) {
  if (!date) {
    return '—';
  }

  return new Date(date).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}
