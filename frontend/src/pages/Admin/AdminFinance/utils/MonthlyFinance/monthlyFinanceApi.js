export async function fetchMonthlyFinance(month) {
  const response = await fetch(
    `https://rma-backend-bo4a.onrender.com/api/admin/orders/monthly-finance?month=${month}`,
    {
      credentials: 'include',
    },
  );

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || 'Failed to fetch monthly finance');

    error.status = response.status;

    throw error;
  }

  return {
    stats: data.stats || {
      totalOrders: 0,
      completedOrders: 0,
      paidOrders: 0,
      pendingOrders: 0,
      rejectedOrders: 0,
      totalTransactionValue: 0,
      completedTransactionValue: 0,
      totalRmaFees: 0,
    },

    orderStatus: data.orderStatus || {
      Pending: 0,
      Accepted: 0,
      Preparing: 0,
      Ready: 0,
      OutForDelivery: 0,
      Completed: 0,
      Rejected: 0,
    },

    shops: data.shops || [],
  };
}
