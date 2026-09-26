import { CalendarDays } from 'lucide-react';

import { formatAmount, formatEarningDate } from '../utils/earningsHelpers';

function RecentEarnings({ recentEarnings }) {
  return (
    <section className="delivery_earnings_section">
      <div className="delivery_earnings_section_header">
        <div>
          <h2>Recent Earnings</h2>

          <span>Completed delivery payments</span>
        </div>

        <CalendarDays size={20} />
      </div>

      {recentEarnings.length === 0 ? (
        <div className="delivery_earnings_empty">
          <strong>No earnings yet</strong>

          <p>Complete your first delivery to see your earnings here.</p>
        </div>
      ) : (
        <div className="delivery_recent_earnings">
          {recentEarnings.map((earning) => (
            <div className="delivery_recent_earning" key={earning.orderId}>
              <div>
                <strong>{earning.orderId}</strong>

                <span>{formatEarningDate(earning.completedAt)}</span>
              </div>

              <strong>{formatAmount(earning.amount)}</strong>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default RecentEarnings;
