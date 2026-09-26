export function formatDateTime(date) {
  if (!date) {
    return '—';
  }

  return new Date(date).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTime(date) {
  if (!date) {
    return '—';
  }

  return new Date(date).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getStatusClass(status) {
  return (status || '').toLowerCase();
}

export function getTimelineSteps(order) {
  return order?.status === 'Rejected'
    ? [
        {
          title: 'Order Placed',
          timestamp: order?.createdAt,
          completed: true,
        },
        {
          title: 'Rejected',
          timestamp: order?.rejectedAt,
          completed: true,
        },
      ]
    : [
        {
          title: 'Order Placed',
          timestamp: order?.createdAt,
          completed: true,
        },
        {
          title: 'Accepted',
          timestamp: order?.acceptedAt,
          completed: Boolean(order?.acceptedAt),
        },
        {
          title: 'Preparing',
          timestamp: order?.preparingAt,
          completed: Boolean(order?.preparingAt),
        },
        {
          title: 'Ready',
          timestamp: order?.readyAt,
          completed: Boolean(order?.readyAt),
        },
        {
          title: 'Out for Delivery',
          timestamp: order?.outForDeliveryAt,
          completed: Boolean(order?.outForDeliveryAt),
        },
        {
          title: 'Completed',
          timestamp: order?.completedAt,
          completed: Boolean(order?.completedAt),
        },
      ];
}
    