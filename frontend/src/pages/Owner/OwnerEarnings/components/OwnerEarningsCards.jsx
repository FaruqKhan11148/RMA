import { Clock3, Package, CheckCircle2 } from 'lucide-react';

function OwnerEarningsCards({ earnings }) {
  return (
    <section className="owner_earnings_cards">
      <div className="owner_earning_card">
        <div className="owner_earning_card_icon pending">
          <Clock3 size={20} />
        </div>

        <div>
          <span>Pending</span>
          <strong>₹{Number(earnings?.pendingEarnings || 0).toFixed(2)}</strong>
        </div>
      </div>

      <div className="owner_earning_card">
        <div className="owner_earning_card_icon processing">
          <Package size={20} />
        </div>

        <div>
          <span>Processing</span>
          <strong>
            ₹{Number(earnings?.processingEarnings || 0).toFixed(2)}
          </strong>
        </div>
      </div>

      <div className="owner_earning_card">
        <div className="owner_earning_card_icon settled">
          <CheckCircle2 size={20} />
        </div>

        <div>
          <span>Settled</span>
          <strong>₹{Number(earnings?.settledEarnings || 0).toFixed(2)}</strong>
        </div>
      </div>
    </section>
  );
}

export default OwnerEarningsCards;
