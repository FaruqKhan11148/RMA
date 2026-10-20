import { IndianRupee } from 'lucide-react';

function OwnerEarningsTotal({ earnings }) {
  const formatAmount = (amount) => `₹${Number(amount || 0).toFixed(2)}`;

  const todayEarnings = Number(earnings?.todayEarnings || 0);
  const totalOwnerEarnings = Number(earnings?.totalOwnerEarnings || 0);
  const pendingSettlementEarnings = Number(
    earnings?.pendingSettlementEarnings || 0,
  );
  const pendingSettlementOrders = Number(
    earnings?.pendingSettlementOrders || 0,
  );
  const settledOrders = Number(earnings?.settledOrders || 0);

  return (
    <section className="owner_earnings_total">
      <div className="owner_earnings_total_icon">
        <IndianRupee size={24} />
      </div>

      <span className="owner_earnings_total_label">
        Today's Settled Earnings
      </span>

      <strong className="owner_earnings_total_amount">
        {formatAmount(todayEarnings)}
      </strong>

      <p className="owner_earnings_total_description">
        Your earnings from orders settled today.
      </p>

      <span className="owner_earnings_total_orders">
        {settledOrders} settled orders
      </span>

      <div className="owner_earnings_summary">
        <div className="owner_earnings_summary_item">
          <span>Total Owner Earnings</span>
          <strong>{formatAmount(totalOwnerEarnings)}</strong>
        </div>

        <div className="owner_earnings_summary_item">
          <span>Pending Settlement Earnings</span>
          <strong>{formatAmount(pendingSettlementEarnings)}</strong>
          <small>{pendingSettlementOrders} orders pending settlement</small>
        </div>
      </div>
    </section>
  );
}

export default OwnerEarningsTotal;
