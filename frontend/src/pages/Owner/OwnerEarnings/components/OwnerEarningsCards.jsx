import { CalendarDays, PackageCheck } from 'lucide-react';

function OwnerEarningsCards({ earnings }) {
  const formatAmount = (amount) => `₹${Number(amount || 0).toFixed(2)}`;

  const settledOrders = Number(earnings?.settledOrders || 0);

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
          <PackageCheck size={19} />
        </div>

        <span>Settled Orders</span>

        <strong>{settledOrders}</strong>
      </div>
    </section>
  );
}

export default OwnerEarningsCards;
