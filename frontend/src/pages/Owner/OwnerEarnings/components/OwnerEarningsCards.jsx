import { CalendarDays, Clock3, CalendarRange, Wallet } from 'lucide-react';

function OwnerEarningsCards({ earnings }) {
  const formatAmount = (amount) => `₹${Number(amount || 0).toFixed(2)}`;

  return (
    <section className="owner_earnings_period_cards">
      <div className="owner_earnings_period_card">
        <div className="owner_earnings_period_icon">
          <CalendarDays size={19} />
        </div>
        <span>This Week</span>
        <strong>{formatAmount(earnings?.weekEarnings)}</strong>
      </div>

      <div className="owner_earnings_period_card">
        <div className="owner_earnings_period_icon">
          <CalendarRange size={19} />
        </div>
        <span>This Month</span>
        <strong>{formatAmount(earnings?.monthEarnings)}</strong>
      </div>

      <div className="owner_earnings_period_card">
        <div className="owner_earnings_period_icon">
          <Wallet size={19} />
        </div>
        <span>Pending Payment to RMA</span>
        <strong>{formatAmount(earnings?.pendingRmaPayment)}</strong>
      </div>

      <div className="owner_earnings_period_card">
        <div className="owner_earnings_period_icon">
          <Clock3 size={19} />
        </div>
        <span>Orders Awaiting Confirmation</span>
        <strong>{Number(earnings?.pendingRmaPaymentOrders || 0)} orders</strong>
      </div>
    </section>
  );
}

export default OwnerEarningsCards;
