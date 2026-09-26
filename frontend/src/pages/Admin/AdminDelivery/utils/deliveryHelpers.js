export function formatDate(date) {
  if (!date) {
    return '—';
  }

  return new Date(date).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function getStatusClass(status) {
  switch (status) {
    case 'Completed':
      return 'status-completed';

    case 'OutForDelivery':
      return 'status-delivery';

    case 'Accepted':
      return 'status-accepted';

    case 'Preparing':
      return 'status-preparing';

    case 'Ready':
      return 'status-ready';

    case 'Rejected':
      return 'status-rejected';

    default:
      return 'status-pending';
  }
}

export function getReadableStatus(status) {
  switch (status) {
    case 'OutForDelivery':
      return 'Out for Delivery';

    default:
      return status || 'Unknown';
  }
}
