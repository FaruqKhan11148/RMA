import './Offers.css';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import OffersHeader from './components/OffersHeader';
import OrderRewardCard from './components/OrderRewardCard';
import ReferralRewardCard from './components/ReferralRewardCard';
import ReferralTrackingCard from './components/ReferralTrackingCard';

import { fetchDailyRewardProgress } from './utils/offersApi';

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

    const loadDailyRewardProgress = async () => {
      try {
        setLoadingOrders(true);
        setOrdersError('');

        const data = await fetchDailyRewardProgress(shopOwner.id);

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

    loadDailyRewardProgress();
  }, [shopOwner?.id]);

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
      <OffersHeader />

      <OrderRewardCard
        loadingOrders={loadingOrders}
        completedOrders={completedOrders}
        targetOrders={targetOrders}
        progress={progress}
        remainingOrders={remainingOrders}
        rewardUnlocked={rewardUnlocked}
        ordersError={ordersError}
        getProgressMessage={getProgressMessage}
        navigate={navigate}
      />

      <ReferralRewardCard
        shopId={shopId}
        copied={copied}
        handleCopyShopId={handleCopyShopId}
      />

      <ReferralTrackingCard handleCopyShopId={handleCopyShopId} />
    </main>
  );
}

export default Offers;
