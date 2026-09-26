import { Bike, CheckCircle2, Wallet } from 'lucide-react';

import { formatAmount } from '../utils/deliveryDashboardHelpers';

function DeliverySummary({ todayEarnings, today }) {
  return (
    <section className="delivery_summary_grid">
      <div className="delivery_summary_card">
        <div className="delivery_summary_icon earnings">
          <Wallet size={19} />
        </div>

        <span>Today's Earnings</span>

        <strong>{formatAmount(todayEarnings)}</strong>
      </div>

      <div className="delivery_summary_card">
        <div className="delivery_summary_icon deliveries">
          <Bike size={19} />
        </div>

        <span>Deliveries</span>

        <strong>{today.orders}</strong>
      </div>

      <div className="delivery_summary_card">
        <div className="delivery_summary_icon completed">
          <CheckCircle2 size={19} />
        </div>

        <span>Completed</span>

        <strong>{today.completed}</strong>
      </div>
    </section>
  );
}

export default DeliverySummary;
