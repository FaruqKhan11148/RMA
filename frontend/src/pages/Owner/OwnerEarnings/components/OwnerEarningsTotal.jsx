import { IndianRupee } from 'lucide-react';

function OwnerEarningsTotal({ earnings }) {
  const todayEarnings = Number(earnings?.todayEarnings || 0);
  const settledOrders = Number(earnings?.settledOrders || 0);

  return (
    <section className="owner_earnings_total">
      <div className="owner_earnings_total_icon">
        <IndianRupee size={24} />
      </div>

      <span className="owner_earnings_total_label">Today's Earnings</span>

      <strong className="owner_earnings_total_amount">
        ₹{todayEarnings.toFixed(2)}
      </strong>

      <p className="owner_earnings_total_description">
        Your earnings from today's settled orders.
      </p>

      <span className="owner_earnings_total_orders">
        {settledOrders} settled orders
      </span>
    </section>
  );
}

export default OwnerEarningsTotal;
