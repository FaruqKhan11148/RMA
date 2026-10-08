import { IndianRupee } from 'lucide-react';

function OwnerEarningsTotal({ earnings }) {
  return (
    <section className="owner_earnings_total">
      <div className="owner_earnings_total_icon">
        <IndianRupee size={24} />
      </div>

      <span className="owner_earnings_total_label">Total Earnings</span>

      <strong className="owner_earnings_total_amount">
        ₹{Number(earnings?.totalSettledEarnings || 0).toFixed(2)}
      </strong>

      <p className="owner_earnings_total_description">
        Your earnings from settled orders.
      </p>

      <span className="owner_earnings_total_orders">
        {earnings?.settledOrders || 0} settled orders
      </span>
    </section>
  );
}

export default OwnerEarningsTotal;
