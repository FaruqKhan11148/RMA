import { formatAmount } from '../utils/paymentHelpers';

function PaymentStats({
  totalPayments,
  paidPayments,
  pendingPayments,
  failedPayments,
  refundedPayments,
  totalPaidAmount,
  totalPendingAmount,
  totalRefundedAmount,
  onlinePayments,
  codPayments,
}) {
  return (
    <div className="payments-stats-grid">
      <div className="payment-stat-card">
        <span>Total Payments</span>
        <strong>{totalPayments}</strong>
      </div>

      <div className="payment-stat-card">
        <span>Paid</span>
        <strong>{paidPayments.length}</strong>
        <small>{formatAmount(totalPaidAmount)}</small>
      </div>

      <div className="payment-stat-card">
        <span>Pending</span>
        <strong>{pendingPayments.length}</strong>
        <small>{formatAmount(totalPendingAmount)}</small>
      </div>

      <div className="payment-stat-card">
        <span>Failed</span>
        <strong>{failedPayments.length}</strong>
      </div>

      <div className="payment-stat-card">
        <span>Refunded</span>
        <strong>{refundedPayments.length}</strong>
        <small>{formatAmount(totalRefundedAmount)}</small>
      </div>

      <div className="payment-stat-card">
        <span>Online</span>
        <strong>{onlinePayments}</strong>
      </div>

      <div className="payment-stat-card">
        <span>COD</span>
        <strong>{codPayments}</strong>
      </div>
    </div>
  );
}

export default PaymentStats;
