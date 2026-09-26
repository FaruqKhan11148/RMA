export const statusSteps = [
  {
    status: 'Pending',
    title: 'Order Placed',
    description: 'Your order has been received.',
  },
  {
    status: 'Accepted',
    title: 'Order Accepted',
    description: 'The shop has accepted your order.',
  },
  {
    status: 'Preparing',
    title: 'Preparing',
    description: 'The shop is preparing your order.',
  },
  {
    status: 'Ready',
    title: 'Ready for Delivery',
    description: 'Your order is ready and will be delivered soon.',
  },
  {
    status: 'OutForDelivery',
    title: 'Out for Delivery',
    description:
      'Your order is on the way. Please check your items carefully when they arrive before sharing the OTP.',
  },
  {
    status: 'Completed',
    title: 'Completed',
    description: 'Your order has been completed.',
  },
];

export const statusOrder = [
  'Pending',
  'Accepted',
  'Preparing',
  'Ready',
  'OutForDelivery',
  'Completed',
];

export const getStatusMessage = (status) => {
  switch (status) {
    case 'Pending':
      return 'Your order has been sent to the shop and is waiting for confirmation.';

    case 'Accepted':
      return 'The shop has accepted your order and will start preparing it soon.';

    case 'Preparing':
      return 'The shop is currently preparing your order.';

    case 'Ready':
      return 'Your order is ready and will be delivered soon.';

    case 'OutForDelivery':
      return 'Your order is on the way. Please provide the delivery OTP when your order arrives.';

    case 'Completed':
      return 'Your order has been completed successfully.';

    case 'Rejected':
      return 'Sorry, the shop has rejected this order.';

    default:
      return 'Your order status has been updated.';
  }
};

export const getShopName = (order) => {
  return order.ownerId?.shopName || 'Shop';
};

export const getOrderRefundInfo = (order) => {
  const isCustomerCancellation =
    order.cancelledBy === 'CUSTOMER' && order.refundType === 'FULL';

  const isDeliveryRejection =
    order.refundType === 'DELIVERY_REJECTION' ||
    Boolean(order.customerRejectedAt);

  const isShopRejection =
    order.status === 'Rejected' &&
    !isCustomerCancellation &&
    !isDeliveryRejection;

  const refundAmount = Number(order.refundAmount || 0);

  const totalPaid = Number(
    order.customerPayableAmount || order.totalPrice || 0,
  );

  const nonRefundedDeliveryCharge = Number(
    Math.max(0, totalPaid - refundAmount).toFixed(2),
  );

  return {
    isCustomerCancellation,
    isDeliveryRejection,
    isShopRejection,
    refundAmount,
    totalPaid,
    nonRefundedDeliveryCharge,
  };
};

export const getRefundDisplayAmount = (order) => {
  return Number(order.refundAmount || 0).toFixed(2);
};
