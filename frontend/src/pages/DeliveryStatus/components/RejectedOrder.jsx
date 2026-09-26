import { getRefundDisplayAmount } from '../utils/deliveryStatusHelpers';
import OrderDetails from './OrderDetails';

function RejectedOrder({ order, shopName, refundInfo, onBackHome }) {
  const {
    isCustomerCancellation,
    isDeliveryRejection,
    isShopRejection,
    nonRefundedDeliveryCharge,
  } = refundInfo;

  const refundAmount = getRefundDisplayAmount(order);

  const heading = isCustomerCancellation
    ? 'Order Cancelled'
    : isDeliveryRejection
      ? 'Delivery Rejected'
      : 'Order Rejected';

  const description = isCustomerCancellation
    ? 'You cancelled this order.'
    : isDeliveryRejection
      ? 'You reported an issue with the delivery and rejected the order.'
      : 'The shop has rejected this order.';

  return (
    <main className="delivery_status">
      <section className="delivery_status_header">
        <h1>{heading}</h1>

        <p>{description}</p>
      </section>

      <section className="order_status_card rejected_card">
        <div className="status_icon">×</div>

        <h2>{heading}</h2>

        <p>
          {isCustomerCancellation
            ? 'You cancelled this order before preparation started.'
            : isDeliveryRejection
              ? 'You rejected the delivery because of an issue with the order.'
              : 'Sorry, the shop has rejected this order.'}
        </p>

        {isShopRejection && order.rejectionReason && (
          <div className="shop_rejection_details">
            <p>
              <strong>Reason:</strong> {order.rejectionReason}
            </p>

            {order.rejectionDescription && (
              <p>
                <strong>Details:</strong> {order.rejectionDescription}
              </p>
            )}
          </div>
        )}
      </section>

      {order.refundStatus === 'Processing' && (
        <section className="order_status_card refund_card">
          <div className="status_icon">₹</div>

          <h2>Refund Initiated</h2>

          <p>
            {order.refundType === 'DELIVERY_REJECTION'
              ? 'Your eligible refund has been sent to the payment provider.'
              : 'Your full payment has been sent to the payment provider for refund.'}
          </p>

          <p>
            <strong>Refund Amount:</strong> ₹{refundAmount}
          </p>

          {order.refundType === 'DELIVERY_REJECTION' &&
            nonRefundedDeliveryCharge > 0 && (
              <p>
                <strong>Delivery Charge Not Refunded:</strong> ₹
                {nonRefundedDeliveryCharge.toFixed(2)}
              </p>
            )}

          {order.refundId && (
            <p>
              <strong>Refund ID:</strong> {order.refundId}
            </p>
          )}

          <p>
            The refund is being processed by the payment provider and will be
            credited to your original payment method.
          </p>
        </section>
      )}

      {order.refundStatus === 'Completed' && (
        <section className="order_status_card refund_card">
          <div className="status_icon">✓</div>

          <h2>Refund Completed</h2>

          <p>
            {order.refundType === 'DELIVERY_REJECTION'
              ? 'Your eligible refund has been credited to your original payment method.'
              : 'Your full payment has been refunded to your original payment method.'}
          </p>

          <p>
            <strong>Refund Amount:</strong> ₹{refundAmount}
          </p>

          {order.refundType === 'DELIVERY_REJECTION' &&
            nonRefundedDeliveryCharge > 0 && (
              <p>
                <strong>Delivery Charge Not Refunded:</strong> ₹
                {nonRefundedDeliveryCharge.toFixed(2)}
              </p>
            )}

          {order.refundId && (
            <p>
              <strong>Refund ID:</strong> {order.refundId}
            </p>
          )}
        </section>
      )}

      {order.refundStatus === 'Failed' && (
        <section className="order_status_card refund_card">
          <div className="status_icon">!</div>

          <h2>Refund Processing</h2>

          <p>
            Your order was rejected, but we could not complete the refund
            request yet.
          </p>

          <p>Please contact RMA support for assistance.</p>
        </section>
      )}

      <OrderDetails order={order} shopName={shopName} />

      <button type="button" className="home_button" onClick={onBackHome}>
        Back to Home
      </button>
    </main>
  );
}

export default RejectedOrder;
