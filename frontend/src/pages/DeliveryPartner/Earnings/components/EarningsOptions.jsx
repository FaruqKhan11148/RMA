import {
  WalletCards,
  BanknoteArrowDown,
  ReceiptText,
  History,
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';

function EarningsOptions() {
  const navigate = useNavigate();

  return (
    <section className="delivery_earnings_options">
      <h2>Money</h2>

      <div className="delivery_earnings_option_group">
        <button
          type="button"
          className="delivery_earnings_option"
          onClick={() => navigate('/delivery/earnings/wallet')}
        >
          <div className="delivery_earnings_option_left">
            <WalletCards className="delivery_earnings_option_icon" />

            <div>
              <strong>Wallet</strong>

              <span>View your balance and wallet</span>
            </div>
          </div>

          <span className="delivery_earnings_option_arrow">›</span>
        </button>

        <button
          type="button"
          className="delivery_earnings_option"
          onClick={() => navigate('/delivery/earnings/withdraw')}
        >
          <div className="delivery_earnings_option_left">
            <BanknoteArrowDown className="delivery_earnings_option_icon" />

            <div>
              <strong>Withdraw Money</strong>

              <span>Request a withdrawal</span>
            </div>
          </div>

          <span className="delivery_earnings_option_arrow">›</span>
        </button>

        <button
          type="button"
          className="delivery_earnings_option"
          onClick={() => navigate('/delivery/earnings/history')}
        >
          <div className="delivery_earnings_option_left">
            <ReceiptText className="delivery_earnings_option_icon" />

            <div>
              <strong>Earnings History</strong>

              <span>View your completed earnings</span>
            </div>
          </div>

          <span className="delivery_earnings_option_arrow">›</span>
        </button>

        <button
          type="button"
          className="delivery_earnings_option"
          onClick={() => navigate('/delivery/earnings/withdrawals')}
        >
          <div className="delivery_earnings_option_left">
            <History className="delivery_earnings_option_icon" />

            <div>
              <strong>Withdrawal History</strong>

              <span>View your previous withdrawals</span>
            </div>
          </div>

          <span className="delivery_earnings_option_arrow">›</span>
        </button>
      </div>
    </section>
  );
}

export default EarningsOptions;
