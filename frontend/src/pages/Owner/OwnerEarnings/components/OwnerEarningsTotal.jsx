import { IndianRupee } from 'lucide-react';

function OwnerEarningsTotal({ earnings }) {
  return (
    <section className="owner_earnings_total">
      <div className="owner_earnings_total_icon">
        <IndianRupee size={22} />
      </div>

      <div>
        <span>Total Earnings</span>
        <strong>₹{Number(earnings?.totalEarnings || 0).toFixed(2)}</strong>
      </div>
    </section>
  );
}

export default OwnerEarningsTotal;
