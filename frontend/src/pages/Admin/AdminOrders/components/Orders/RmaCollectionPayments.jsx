import './RmaCollectionPayments.css';

import { useState } from 'react';
import { confirmRmaCollectionPayment } from '../../utils/Orders/ordersApi';

function RmaCollectionPayments({ orders = [], onOrderUpdated, formatDate }) {
  const [confirmingOrderId, setConfirmingOrderId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const pendingPayments = orders.filter(
    (order) =>
      order.orderType === 'delivery' &&
      order.deliveryAssignmentType === 'RMA' &&
      order.deliveryAssignmentStatus === 'ACCEPTED' &&
      order.rmaCollectionPayment?.status === 'BOTH_MARKED_PAID',
  );

  const handleConfirm = async (order) => {
    const payment = order.rmaCollectionPayment;

    const approved = window.confirm(
      `Confirm ₹${Number(payment?.amount || 0).toFixed(2)} received for order ${order.orderId}?\n\nVerify the actual incoming transaction in the RMA UPI/bank account. Match the amount and transaction reference where available. Owner and DP acknowledgements are not proof that the money arrived.`,
    );

    if (!approved) return;

    setConfirmingOrderId(order.orderId);
    setError('');
    setSuccess('');

    try {
      const result = await confirmRmaCollectionPayment(order.orderId);

      onOrderUpdated?.({
        ...order,
        rmaCollectionPayment: {
          ...payment,
          ...(result.payment || {}),
          status: result.payment?.status || 'CONFIRMED',
        },
      });

      setSuccess(`Payment confirmed for ${order.orderId}.`);
    } catch (err) {
      setError(err.message || 'Failed to confirm payment.');
    } finally {
      setConfirmingOrderId(null);
    }
  };

  return (
    <section className="rma-collection-payments">
      <h2>RMA Payments Awaiting Verification</h2>

      <p>
        These payments have been acknowledged by both the owner and assigned
        delivery partner. Verify the actual incoming transaction in your
        UPI/bank account before confirming. Screenshots and acknowledgements
        alone are not proof.
      </p>

      {error && <p role="alert">{error}</p>}
      {success && <p role="status">{success}</p>}

      {pendingPayments.length === 0 ? (
        <p>No RMA collection payments are awaiting verification.</p>
      ) : (
        <div>
          {pendingPayments.map((order) => {
            const payment = order.rmaCollectionPayment;
            const owner = order.ownerId || {};

            return (
              <div
                key={order._id || order.orderId}
                className="rma-collection-payment-row"
              >
                <h3>Order {order.orderId}</h3>

                <p>Shop: {owner.shopName || '-'}</p>
                <p>Shop ID: {owner.shopId || '-'}</p>
                <p>Owner: {owner.ownerName || '-'}</p>

                <p>
                  Amount to RMA:{' '}
                  <strong>₹{Number(payment.amount || 0).toFixed(2)}</strong>
                </p>

                <p>RMA UPI ID: {payment.upiId || '-'}</p>
                <p>
                  Transaction reference: {payment.reference || 'Not provided'}
                </p>

                <p>
                  Owner marked sent:{' '}
                  {payment.ownerMarkedPaidAt
                    ? formatDate(payment.ownerMarkedPaidAt)
                    : '-'}
                </p>

                <p>
                  DP acknowledged:{' '}
                  {payment.dpAcknowledgedAt
                    ? formatDate(payment.dpAcknowledgedAt)
                    : '-'}
                </p>

                <p>
                  DP acknowledgment recorded:{' '}
                  {payment.dpAcknowledgedBy ? 'Yes' : 'Missing'}
                </p>

                <button
                  type="button"
                  onClick={() => handleConfirm(order)}
                  disabled={
                    confirmingOrderId !== null ||
                    !payment.ownerMarkedPaidAt ||
                    !payment.dpAcknowledgedAt ||
                    !payment.dpAcknowledgedBy
                  }
                >
                  {confirmingOrderId === order.orderId
                    ? 'Confirming...'
                    : 'Confirm Received Payment'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default RmaCollectionPayments;
