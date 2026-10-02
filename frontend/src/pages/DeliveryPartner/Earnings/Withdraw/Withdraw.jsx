import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  BanknoteArrowDown,
  WalletCards,
  LoaderCircle,
  CheckCircle2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import './Withdraw.css';

import {
  fetchDeliveryWallet,
  requestDeliveryWithdrawal,
} from './utils/withdrawApi';

function Withdraw() {
  const navigate = useNavigate();

  const [availableBalance, setAvailableBalance] = useState(0);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadWallet = async () => {
      try {
        const token = localStorage.getItem('delivery_token');

        if (!token) {
          setError('Delivery partner session not found');
          setLoading(false);
          return;
        }

        const data = await fetchDeliveryWallet(token);

        setAvailableBalance(Number(data.wallet?.walletBalance || 0));
      } catch (walletError) {
        console.error('Fetch wallet for withdrawal failed:', walletError);

        setError(walletError.message || 'Unable to load wallet');
      } finally {
        setLoading(false);
      }
    };

    loadWallet();
  }, []);

  const handleAmountChange = (event) => {
    const value = event.target.value;

    if (value === '') {
      setAmount('');
      setError('');
      setSuccess('');
      return;
    }

    if (!/^\d*\.?\d{0,2}$/.test(value)) {
      return;
    }

    setAmount(value);
    setError('');
    setSuccess('');
  };

  const handleMaxAmount = () => {
    setAmount(availableBalance.toFixed(2));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');
    setSuccess('');

    const withdrawalAmount = Number(amount);

    if (!Number.isFinite(withdrawalAmount) || withdrawalAmount <= 0) {
      setError('Enter a valid withdrawal amount.');
      return;
    }

    if (withdrawalAmount > availableBalance) {
      setError(`You can withdraw up to ₹${availableBalance.toFixed(2)}.`);
      return;
    }

    try {
      setSubmitting(true);

      const token = localStorage.getItem('delivery_token');

      if (!token) {
        setError('Delivery partner session not found.');
        return;
      }

      const data = await requestDeliveryWithdrawal(token, withdrawalAmount);

      setSuccess(data.message || 'Withdrawal request submitted successfully.');

      setAvailableBalance(Number(data.availableBalance || 0));

      setAmount('');
    } catch (withdrawError) {
      console.error('Request delivery withdrawal failed:', withdrawError);

      setError(withdrawError.message || 'Unable to submit withdrawal request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="delivery_withdraw_page">
      <header className="delivery_withdraw_header">
        <button
          type="button"
          className="delivery_withdraw_back"
          onClick={() => navigate('/delivery/earnings')}
          aria-label="Back to earnings"
        >
          <ArrowLeft size={21} />
        </button>

        <div>
          <span>Delivery Partner</span>
          <h1>Withdraw Money</h1>
        </div>
      </header>

      {loading ? (
        <section className="delivery_withdraw_empty">
          <LoaderCircle className="delivery_withdraw_loader" size={24} />

          <strong>Loading wallet...</strong>

          <p>Please wait.</p>
        </section>
      ) : (
        <>
          <section className="delivery_withdraw_balance">
            <div className="delivery_withdraw_balance_icon">
              <WalletCards size={22} />
            </div>

            <span>Available Balance</span>

            <strong>₹{availableBalance.toFixed(2)}</strong>

            <p>Amount currently available for withdrawal.</p>
          </section>

          <form className="delivery_withdraw_form" onSubmit={handleSubmit}>
            <div className="delivery_withdraw_form_header">
              <div>
                <h2>Enter Amount</h2>

                <span>Enter the amount you want to withdraw.</span>
              </div>

              <BanknoteArrowDown size={20} />
            </div>

            <div className="delivery_withdraw_input_wrapper">
              <span>₹</span>

              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={handleAmountChange}
                placeholder="0.00"
                disabled={submitting}
                aria-label="Withdrawal amount"
              />
            </div>

            <button
              type="button"
              className="delivery_withdraw_max"
              onClick={handleMaxAmount}
              disabled={submitting || availableBalance <= 0}
            >
              Use maximum available
            </button>

            {error && (
              <div className="delivery_withdraw_message error">{error}</div>
            )}

            {success && (
              <div className="delivery_withdraw_message success">
                <CheckCircle2 size={18} />

                <span>{success}</span>
              </div>
            )}

            <button
              type="submit"
              className="delivery_withdraw_submit"
              disabled={
                submitting || loading || availableBalance <= 0 || !amount
              }
            >
              {submitting ? (
                <>
                  <LoaderCircle
                    className="delivery_withdraw_button_loader"
                    size={18}
                  />
                  Submitting...
                </>
              ) : (
                'Request Withdrawal'
              )}
            </button>
          </form>

          <section className="delivery_withdraw_info">
            <strong>How withdrawals work</strong>

            <p>
              Your request will be sent for admin processing. The amount will
              remain in processing until the withdrawal is completed or
              rejected.
            </p>
          </section>
        </>
      )}
    </main>
  );
}

export default Withdraw;
