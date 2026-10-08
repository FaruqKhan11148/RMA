import {
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  Receipt,
} from 'lucide-react';

function OwnerEarningsMoney({ earnings, onHistoryClick }) {
  const formatAmount = (amount) => `₹${Number(amount || 0).toFixed(2)}`;

  return (
    <section className="owner_earnings_money">
      <h2>Money</h2>

      <div className="owner_earnings_money_list">
        <button type="button" className="owner_earnings_money_item">
          <div className="owner_earnings_money_icon">
            <Receipt size={20} />
          </div>

          <div className="owner_earnings_money_text">
            <strong>Product Sales</strong>
            <span>{formatAmount(earnings?.totalProductSales)}</span>
          </div>

          <ChevronRight size={19} />
        </button>

        <button type="button" className="owner_earnings_money_item">
          <div className="owner_earnings_money_icon">
            <CircleDollarSign size={20} />
          </div>

          <div className="owner_earnings_money_text">
            <strong>RMA Fees Paid</strong>
            <span>{formatAmount(earnings?.totalRmaFees)}</span>
          </div>

          <ChevronRight size={19} />
        </button>

        <button
          type="button"
          className="owner_earnings_money_item"
          onClick={onHistoryClick}
        >
          <div className="owner_earnings_money_icon">
            <ClipboardList size={20} />
          </div>

          <div className="owner_earnings_money_text">
            <strong>Earnings History</strong>
            <span>View your settled orders</span>
          </div>

          <ChevronRight size={19} />
        </button>
      </div>
    </section>
  );
}

export default OwnerEarningsMoney;
    