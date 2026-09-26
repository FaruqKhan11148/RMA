import { IndianRupee } from 'lucide-react';

import { formatAmount } from '../utils/earningsHelpers';

function TotalEarnings({ totalEarnings }) {
  return (
    <section className="delivery_total_earnings">
      <div className="delivery_total_earnings_icon">
        <IndianRupee size={22} />
      </div>

      <span>Total Earnings</span>

      <strong>{formatAmount(totalEarnings)}</strong>

      <p>Your earnings from completed deliveries.</p>
    </section>
  );
}

export default TotalEarnings;
