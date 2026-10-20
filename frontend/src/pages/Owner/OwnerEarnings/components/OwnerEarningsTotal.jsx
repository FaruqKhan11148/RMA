import { IndianRupee } from 'lucide-react';

function OwnerEarningsTotal({ earnings }) {
  const formatAmount = (amount) => `₹${Number(amount || 0).toFixed(2)}`;

  const todayEarnings = Number(earnings?.todayEarnings || 0);
  const totalOwnerEarnings = Number(earnings?.totalOwnerEarnings || 0);
  const pendingRmaPayment = Number(earnings?.pendingRmaPayment || 0);
  const pendingRmaPaymentOrders = Number(
    earnings?.pendingRmaPaymentOrders || 0,
  );

  return (
    <section className="owner_earnings_total">
      <div className="owner_earnings_total_icon">
        <IndianRupee size={24} />
      </div>

      <span className="owner_earnings_total_label">Today's Earnings</span>

      <strong className="owner_earnings_total_amount">
        {formatAmount(todayEarnings)}
      </strong>

      <p className="owner_earnings_total_description">
        Your earnings from paid orders.
      </p>

      <div className="owner_earnings_summary">
        <div className="owner_earnings_summary_item">
          <span>Total Owner Earnings</span>
          <strong>{formatAmount(totalOwnerEarnings)}</strong>
        </div>

        <div className="owner_earnings_summary_item">
          <span>Pending Payment to RMA</span>
          <strong>{formatAmount(pendingRmaPayment)}</strong>
          <small>
            {pendingRmaPaymentOrders}{' '}
            {pendingRmaPaymentOrders === 1 ? 'order' : 'orders'} awaiting
            confirmation
          </small>
        </div>
      </div>
    </section>
  );
}

export default OwnerEarningsTotal;
