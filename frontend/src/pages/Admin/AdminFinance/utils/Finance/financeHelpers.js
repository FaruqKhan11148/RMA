export function calculateFinanceSummary(orders) {
  let grossOrderValue = 0;
  let totalRmaRevenue = 0;
  let totalOwnerSettlement = 0;

  let paidRevenue = 0;
  let pendingPaymentValue = 0;
  let failedPaymentValue = 0;
  let refundedValue = 0;

  let paidOrders = 0;
  let pendingOrders = 0;
  let failedOrders = 0;
  let refundedOrders = 0;

  orders.forEach((order) => {
    const total = Number(order.totalPrice || 0);
    const rmaFee = Number(order.rmaFee || total * 0.01);
    const ownerAmount = Number(order.ownerAmount ?? total - rmaFee);

    grossOrderValue += total;
    totalRmaRevenue += rmaFee;
    totalOwnerSettlement += ownerAmount;

    if (order.paymentStatus === 'Paid') {
      paidRevenue += total;
      paidOrders += 1;
    }

    if (order.paymentStatus === 'Pending') {
      pendingPaymentValue += total;
      pendingOrders += 1;
    }

    if (order.paymentStatus === 'Failed') {
      failedPaymentValue += total;
      failedOrders += 1;
    }

    if (order.paymentStatus === 'Refunded') {
      refundedValue += total;
      refundedOrders += 1;
    }
  });

  return {
    grossOrderValue,
    totalRmaRevenue,
    totalOwnerSettlement,

    paidRevenue,
    pendingPaymentValue,
    failedPaymentValue,
    refundedValue,

    paidOrders,
    pendingOrders,
    failedOrders,
    refundedOrders,

    totalOrders: orders.length,
  };
}

export function filterFinanceOrders(orders, search, paymentFilter) {
  const searchValue = search.trim().toLowerCase();

  return orders.filter((order) => {
    const owner = order.ownerId || {};

    const matchesSearch =
      !searchValue ||
      order.orderId?.toLowerCase().includes(searchValue) ||
      order.customer?.name?.toLowerCase().includes(searchValue) ||
      order.customer?.phone?.toLowerCase().includes(searchValue) ||
      owner.shopName?.toLowerCase().includes(searchValue) ||
      owner.shopId?.toLowerCase().includes(searchValue);

    const matchesPayment =
      paymentFilter === 'ALL' || order.paymentStatus === paymentFilter;

    return matchesSearch && matchesPayment;
  });
}

export function calculateShopFinance(orders) {
  const shopMap = {};

  orders.forEach((order) => {
    const owner = order.ownerId || {};

    const shopId = owner.shopId || 'UNKNOWN';
    const shopName = owner.shopName || 'Unknown Shop';

    if (!shopMap[shopId]) {
      shopMap[shopId] = {
        shopId,
        shopName,
        orders: 0,
        grossValue: 0,
        rmaRevenue: 0,
        ownerSettlement: 0,
        paidValue: 0,
        pendingValue: 0,
      };
    }

    const total = Number(order.totalPrice || 0);
    const rmaFee = Number(order.rmaFee || total * 0.01);
    const ownerAmount = Number(order.ownerAmount ?? total - rmaFee);

    shopMap[shopId].orders += 1;
    shopMap[shopId].grossValue += total;
    shopMap[shopId].rmaRevenue += rmaFee;
    shopMap[shopId].ownerSettlement += ownerAmount;

    if (order.paymentStatus === 'Paid') {
      shopMap[shopId].paidValue += total;
    }

    if (order.paymentStatus === 'Pending') {
      shopMap[shopId].pendingValue += total;
    }
  });

  return Object.values(shopMap).sort((a, b) => b.grossValue - a.grossValue);
}

export function formatMoney(amount) {
  return `₹${Number(amount || 0).toFixed(2)}`;
}

export function formatDate(date) {
  if (!date) {
    return '-';
  }

  return new Date(date).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function getPaymentClass(status) {
  switch (status) {
    case 'Paid':
      return 'finance-status finance-status-paid';

    case 'Pending':
      return 'finance-status finance-status-pending';

    case 'Failed':
      return 'finance-status finance-status-failed';

    case 'Refunded':
      return 'finance-status finance-status-refunded';

    default:
      return 'finance-status';
  }
}
