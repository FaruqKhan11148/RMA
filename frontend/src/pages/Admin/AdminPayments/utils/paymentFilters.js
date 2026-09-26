export const filterPayments = (
  orders,
  search,
  paymentStatusFilter,
  paymentMethodFilter,
) => {
  return orders.filter((order) => {
    const owner = order.ownerId || {};
    const customer = order.customer || {};

    const searchText = search.toLowerCase().trim();

    const matchesSearch =
      !searchText ||
      order.orderId?.toLowerCase().includes(searchText) ||
      customer.name?.toLowerCase().includes(searchText) ||
      customer.phone?.toLowerCase().includes(searchText) ||
      owner.shopName?.toLowerCase().includes(searchText) ||
      owner.shopId?.toLowerCase().includes(searchText) ||
      order.paymentId?.toLowerCase().includes(searchText) ||
      order.paymentOrderId?.toLowerCase().includes(searchText);

    const matchesPaymentStatus =
      paymentStatusFilter === 'ALL' ||
      order.paymentStatus === paymentStatusFilter;

    const matchesPaymentMethod =
      paymentMethodFilter === 'ALL' ||
      order.paymentMethod === paymentMethodFilter;

    return matchesSearch && matchesPaymentStatus && matchesPaymentMethod;
  });
};
