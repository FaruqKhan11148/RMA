import { IndianRupee, TrendingUp } from 'lucide-react';

import { formatAmount } from '../utils/earningsHelpers';

function EarningsSummary({ todayEarnings, weekEarnings }) {
  return (
    <section className="delivery_earnings_grid">
      <div className="delivery_earning_card">
        <div className="delivery_earning_icon">
          <IndianRupee size={18} />
        </div>

        <span>Today</span>

        <strong>{formatAmount(todayEarnings)}</strong>
      </div>

      <div className="delivery_earning_card">
        <div className="delivery_earning_icon">
          <TrendingUp size={18} />
        </div>

        <span>This Week</span>

        <strong>{formatAmount(weekEarnings)}</strong>
      </div>
    </section>
  );
}

export default EarningsSummary;
