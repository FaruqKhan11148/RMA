import {
  CalendarDays,
  PackageCheck,
  Clock3,
  CalendarRange,
} from 'lucide-react';

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
          <PackageCheck size={19} />
        </div>
        <span>Settled Orders</span>
        <strong>{Number(earnings?.settledOrders || 0)}</strong>
      </div>

      <div className="owner_earnings_period_card">
        <div className="owner_earnings_period_icon">
          <Clock3 size={19} />
        </div>
        <span>Pending Settlement</span>
        <strong>{Number(earnings?.pendingSettlementOrders || 0)} orders</strong>
      </div>
    </section>
  );
}

export default OwnerEarningsCards;
