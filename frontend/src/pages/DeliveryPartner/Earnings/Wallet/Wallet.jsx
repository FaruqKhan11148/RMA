import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  WalletCards,
  Clock3,
  CircleDollarSign,
  LoaderCircle,
  Banknote,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import './Wallet.css';

import { fetchDeliveryWallet } from './utils/walletApi';

function Wallet() {
  const navigate = useNavigate();

  const [wallet, setWallet] = useState({
    totalEarned: 0,
    pendingAmount: 0,
    availableAmount: 0,
    processingAmount: 0,
    withdrawnAmount: 0,
    walletBalance: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

        setWallet({
          totalEarned: Number(data.wallet?.totalEarned || 0),
          pendingAmount: Number(data.wallet?.pendingAmount || 0),
          availableAmount: Number(data.wallet?.availableAmount || 0),
          processingAmount: Number(data.wallet?.processingAmount || 0),
          withdrawnAmount: Number(data.wallet?.withdrawnAmount || 0),
          walletBalance: Number(data.wallet?.walletBalance || 0),
        });
      } catch (walletError) {
        console.error('Fetch delivery wallet failed:', walletError);

        setError(walletError.message || 'Unable to load wallet');
      } finally {
        setLoading(false);
      }
    };

    loadWallet();
  }, []);

  const formatAmount = (amount) => {
    return `₹${Number(amount || 0).toFixed(2)}`;
  };

  if (loading) {
    return (
      <main className="delivery_wallet_page">
        <header className="delivery_wallet_header">
          <button
            type="button"
            className="delivery_wallet_back"
            onClick={() => navigate('/delivery/earnings')}
            aria-label="Back to earnings"
          >
            <ArrowLeft size={21} />
          </button>

          <div>
            <span>Delivery Partner</span>
            <h1>Wallet</h1>
          </div>
        </header>

        <section className="delivery_wallet_empty">
          <LoaderCircle className="delivery_wallet_loader" size={24} />

          <strong>Loading wallet...</strong>

          <p>Please wait.</p>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="delivery_wallet_page">
        <header className="delivery_wallet_header">
          <button
            type="button"
            className="delivery_wallet_back"
            onClick={() => navigate('/delivery/earnings')}
            aria-label="Back to earnings"
          >
            <ArrowLeft size={21} />
          </button>

          <div>
            <span>Delivery Partner</span>
            <h1>Wallet</h1>
          </div>
        </header>

        <section className="delivery_wallet_empty">
          <strong>{error}</strong>

          <p>Please try again later.</p>

          <button
            type="button"
            className="delivery_wallet_retry"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="delivery_wallet_page">
      <header className="delivery_wallet_header">
        <button
          type="button"
          className="delivery_wallet_back"
          onClick={() => navigate('/delivery/earnings')}
          aria-label="Back to earnings"
        >
          <ArrowLeft size={21} />
        </button>

        <div>
          <span>Delivery Partner</span>
          <h1>Wallet</h1>
        </div>
      </header>

      <section className="delivery_wallet_balance">
        <div className="delivery_wallet_balance_icon">
          <WalletCards size={24} />
        </div>

        <span>Available Balance</span>

        <strong>{formatAmount(wallet.walletBalance)}</strong>

        <p>Amount currently available for withdrawal.</p>
      </section>

      <section className="delivery_wallet_summary">
        <div className="delivery_wallet_summary_card">
          <div className="delivery_wallet_summary_icon">
            <CircleDollarSign size={19} />
          </div>

          <span>Total Earned</span>

          <strong>{formatAmount(wallet.totalEarned)}</strong>
        </div>

        <div className="delivery_wallet_summary_card">
          <div className="delivery_wallet_summary_icon">
            <Clock3 size={19} />
          </div>

          <span>Pending</span>

          <strong>{formatAmount(wallet.pendingAmount)}</strong>
        </div>

        <div className="delivery_wallet_summary_card">
          <div className="delivery_wallet_summary_icon">
            <LoaderCircle size={19} />
          </div>

          <span>Processing</span>

          <strong>{formatAmount(wallet.processingAmount)}</strong>
        </div>

        <div className="delivery_wallet_summary_card">
          <div className="delivery_wallet_summary_icon">
            <Banknote size={19} />
          </div>

          <span>Withdrawn</span>

          <strong>{formatAmount(wallet.withdrawnAmount)}</strong>
        </div>
      </section>

      <section className="delivery_wallet_info">
        <div>
          <strong>Available for withdrawal</strong>

          <span>
            Only released earnings can be withdrawn. Pending earnings become
            available after they are released.
          </span>
        </div>
      </section>
    </main>
  );
}

export default Wallet;
