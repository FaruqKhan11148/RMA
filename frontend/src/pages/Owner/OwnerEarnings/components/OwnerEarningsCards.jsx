import { CalendarDays, TrendingUp } from 'lucide-react';

function OwnerEarningsCards({ earnings }) {
  const formatAmount = (amount) => `₹${Number(amount || 0).toFixed(2)}`;

  return (
    <section className="owner_earnings_period_cards">
      <div className="owner_earnings_period_card">
        <div className="owner_earnings_period_icon">
          <CalendarDays size={19} />
        </div>

        <span>Today</span>

        <strong>{formatAmount(earnings?.todayEarnings)}</strong>
      </div>

      <div className="owner_earnings_period_card">
        <div className="owner_earnings_period_icon">
          <TrendingUp size={19} />
        </div>

        <span>This Week</span>

        <strong>{formatAmount(earnings?.weekEarnings)}</strong>
      </div>
    </section>
  );
}

export default OwnerEarningsCards;
