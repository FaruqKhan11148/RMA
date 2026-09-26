export function formatDate(date) {
  if (!date) {
    return '-';
  }

  return new Date(date).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function getStatusClass(status) {
  switch (status) {
    case 'Pending':
      return 'pending';

    case 'Accepted':
      return 'accepted';

    case 'Preparing':
      return 'preparing';

    case 'Ready':
      return 'ready';

    case 'OutForDelivery':
      return 'out-for-delivery';

    case 'Completed':
      return 'completed';

    case 'Rejected':
      return 'rejected';

    default:
      return '';
  }
}

export function getPaymentClass(status) {
  switch (status) {
    case 'Paid':
      return 'paid';

    case 'Failed':
      return 'failed';

    case 'Refunded':
      return 'refunded';

    case 'Pending':
    default:
      return 'payment-pending';
  }
}
