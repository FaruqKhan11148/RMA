export function getCurrentMonth() {
  const now = new Date();

  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function formatCurrency(value) {
  return `₹${Number(value || 0).toFixed(2)}`;
}

export function formatStatus(status) {
  if (status === 'OutForDelivery') {
    return 'Out For Delivery';
  }

  return status;
}
