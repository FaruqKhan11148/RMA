import './Offers.css';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Offers() {
  const navigate = useNavigate();

  const shopOwner = JSON.parse(localStorage.getItem('rma_owner'));

  const targetOrders = 60;

  const [completedOrders, setCompletedOrders] = useState(0);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState('');
  const [rewardUnlocked, setRewardUnlocked] = useState(false);

  const remainingOrders = Math.max(targetOrders - completedOrders, 0);

  const progress = Math.min((completedOrders / targetOrders) * 100, 100);

  useEffect(() => {
    if (!shopOwner?.id) {
      setOrdersError('Owner information not found.');
      setLoadingOrders(false);
      return;
    }

    const fetchDailyRewardProgress = async () => {
      try {
        setLoadingOrders(true);
        setOrdersError('');

        const response = await fetch(
          `https://rma-backend-bo4a.onrender.com/api/orders/owner/${shopOwner.id}/daily-reward`,
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || 'Failed to fetch daily reward progress',
          );
        }

        setCompletedOrders(Number(data.completedOrders) || 0);

        setRewardUnlocked(Boolean(data.rewardUnlocked));
      } catch (error) {
        console.error('Fetch daily reward progress failed:', error);

        setOrdersError(
          error.message || 'Failed to load daily reward progress.',
        );
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchDailyRewardProgress();
  }, [shopOwner.id]);

  const shopId = shopOwner?.shopId || '';

  const [copied, setCopied] = useState(false);

  const handleCopyShopId = async () => {
    try {
      await navigator.clipboard.writeText(shopId);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy shop ID:', error);
    }
  };

  const getProgressMessage = () => {
    if (completedOrders >= targetOrders) {
      return 'Reward unlocked! ₹199 is yours.';
    }

    if (remainingOrders === 1) {
      return 'ONE MORE ORDER! Complete it to unlock ₹199.';
    }

    if (remainingOrders <= 5) {
      return `So close! Just ${remainingOrders} more orders to go.`;
    }

    if (completedOrders >= 40) {
      return `You're almost there! ${remainingOrders} more orders to go.`;
    }

    if (completedOrders > 0) {
      return `Great start! ${remainingOrders} more orders to go.`;
    }

    return 'Your journey starts here. Complete your first order!';
  };

  return (
    <main className="owner_offers">
      {/* ========================================
          HEADER
      ======================================== */}

      <section className="owner_offers_header">
        <div>
          <span className="owner_offers_eyebrow">RMA REWARDS</span>

          <h1>Offers & Rewards</h1>

          <p>
            Complete more orders, refer shop owners and earn rewards from RMA.
          </p>
        </div>
      </section>

      {/* ========================================
          ORDER REWARD
      ======================================== */}

      <section className="offer_card order_reward_card">
        <div className="offer_card_top">
          <div>
            <span className="offer_badge">1. ORDER REWARD</span>

            <h2>Complete 60 orders</h2>

            <p>
              Complete 60 orders and earn
              <strong> ₹199</strong>.
            </p>
          </div>

          <div className="offer_reward_amount">₹199</div>
        </div>

        {/* CIRCULAR PROGRESS */}

        <div className="order_progress_section">
          <div
            className="circular_progress"
            style={{
              '--progress': `${progress * 3.6}deg`,
            }}
          >
            <div className="circular_progress_inner">
              {loadingOrders ? (
                <>
                  <strong>...</strong>
                  <small>loading</small>
                </>
              ) : (
                <>
                  <strong>{completedOrders}</strong>

                  <span>of {targetOrders}</span>

                  <small>completed today</small>
                </>
              )}
            </div>
          </div>

          <div className="order_progress_info">
            <span className="progress_percentage">
              {Math.round(progress)}% complete
            </span>

            <h3>
              {loadingOrders
                ? 'Checking today’s progress...'
                : rewardUnlocked
                  ? 'Reward unlocked!'
                  : `${remainingOrders} more to go`}
            </h3>

            <p>
              {loadingOrders
                ? 'Loading your completed orders...'
                : getProgressMessage()}
            </p>

            <div className="order_progress_bar">
              <div
                className="order_progress_bar_fill"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>

            <span className="progress_hint">
              Keep completing orders to reach ₹199.
            </span>

            {ordersError && (
              <span className="progress_error">{ordersError}</span>
            )}
          </div>
        </div>

        {/* REWARD STATUS */}

        <div className="offer_status">
          <div className="offer_status_icon">
            {completedOrders >= targetOrders ? '✓' : '↗'}
          </div>

          <div>
            <strong>
              {completedOrders >= targetOrders
                ? '₹199 Reward Unlocked'
                : '₹199 Reward in Progress'}
            </strong>

            <span>
              {completedOrders >= targetOrders
                ? 'Your order target has been completed.'
                : 'Only completed orders count towards this reward.'}
            </span>
          </div>
        </div>

        <button
          type="button"
          className="offer_primary_button"
          onClick={() => navigate('/owner/orders')}
        >
          <span>
            {completedOrders >= targetOrders
              ? 'View Completed Orders'
              : 'Keep Completing Orders'}
          </span>

          <span>→</span>
        </button>
      </section>

      {/* ========================================
          REFERRAL REWARD
      ======================================== */}

      <section className="offer_card referral_reward_card">
        <div className="offer_card_top">
          <div>
            <span className="offer_badge">2. REFER & EARN</span>

            <h2>Refer a shop owner</h2>

            <p>
              Refer another shop owner to RMA and earn
              <strong> ₹300</strong>.
            </p>
          </div>

          <div className="offer_reward_amount">₹300</div>
        </div>

        <div className="referral_steps">
          <div className="referral_step">
            <div className="referral_step_number">1</div>

            <div>
              <strong>Share your shop ID</strong>

              <span>
                Give your RMA shop ID to a shop owner you want to refer.
              </span>
            </div>
          </div>

          <div className="referral_line" />

          <div className="referral_step">
            <div className="referral_step_number">2</div>

            <div>
              <strong>They register with RMA</strong>

              <span>
                Your referred shop owner must register using your referral.
              </span>
            </div>
          </div>

          <div className="referral_line" />

          <div className="referral_step">
            <div className="referral_step_number">3</div>

            <div>
              <strong>They stay active for 28 days</strong>

              <span>
                Their account remains under the 28-day qualification period.
              </span>
            </div>
          </div>

          <div className="referral_line" />

          <div className="referral_step">
            <div className="referral_step_number">4</div>

            <div>
              <strong>You receive ₹300</strong>

              <span>
                Once the referral qualifies, your ₹300 reward becomes eligible.
              </span>
            </div>
          </div>
        </div>

        {/* SHOP ID */}

        <div className="referral_id_box">
          <div>
            <span>Your Shop ID</span>

            <strong>{shopId}</strong>
          </div>

          <button type="button" onClick={handleCopyShopId}>
            {copied ? 'Copied' : 'Copy ID'}
          </button>
        </div>

        <button
          type="button"
          className="offer_primary_button"
          onClick={handleCopyShopId}
        >
          <span>{copied ? 'Shop ID Copied' : 'Share My Referral ID'}</span>

          <span>→</span>
        </button>
      </section>

      {/* ========================================
          REFERRAL TRACKING
      ======================================== */}

      <section className="offer_card referral_tracking_card">
        <div className="tracking_header">
          <div>
            <span className="offer_badge">3. MY REFERRALS</span>

            <h2>Track your referrals</h2>
          </div>

          <span className="tracking_count">0</span>
        </div>

        <div className="no_referrals">
          <div className="no_referrals_icon">+</div>

          <h3>No referrals yet</h3>

          <p>
            Refer your first shop owner and start your 28-day reward journey.
          </p>

          <button type="button" onClick={handleCopyShopId}>
            Share My Shop ID
          </button>
        </div>
      </section>
    </main>
  );
}

export default Offers;
