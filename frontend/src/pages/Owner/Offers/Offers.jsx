import './Offers.css';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import OffersHeader from './components/OffersHeader';
import OrderRewardCard from './components/OrderRewardCard';
import ReferralRewardCard from './components/ReferralRewardCard';

import {
  fetchDailyRewardProgress,
  fetchReferralCode,
  fetchReferralProgress,
} from './utils/offersApi';

function Offers() {
  const navigate = useNavigate();

  const shopOwner = JSON.parse(localStorage.getItem('rma_owner'));

  // =========================
  // Offer 1 — Order Reward
  // =========================

  const [completedOrders, setCompletedOrders] = useState(0);
  const [targetOrders, setTargetOrders] = useState(25);
  const [rewardRate, setRewardRate] = useState(1.66);
  const [rewardAmount, setRewardAmount] = useState(0);

  const [rewardUnlocked, setRewardUnlocked] = useState(false);
  const [rewardTransferred, setRewardTransferred] = useState(false);
  const [shopClosed, setShopClosed] = useState(false);

  const [businessDate, setBusinessDate] = useState('');
  const [openingTime, setOpeningTime] = useState('');
  const [closingTime, setClosingTime] = useState('');

  const [loadingOrders, setLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState('');

  // =========================
  // Offer 2 — Refer & Earn
  // =========================

  const [referralCode, setReferralCode] = useState('');
  const [copied, setCopied] = useState(false);

  const [referralProgress, setReferralProgress] = useState(null);
  const [loadingReferrals, setLoadingReferrals] = useState(true);
  const [referralError, setReferralError] = useState('');

  // =========================
  // Offer 1 calculations
  // =========================

  const remainingOrders = Math.max(targetOrders - completedOrders, 0);

  const progress =
    targetOrders > 0
      ? Math.min((completedOrders / targetOrders) * 100, 100)
      : 0;

  // =========================
  // Load Offer 1 progress
  // =========================

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
        setRewardTransferred(false);

        const data = await fetchDailyRewardProgress(shopOwner.id);

        setCompletedOrders(Number(data.completedOrders) || 0);

        setTargetOrders(Number(data.targetOrders) || 25);

        setRewardRate(Number(data.rewardRate) || 1.66);

        setRewardAmount(Number(data.rewardAmount) || 0);

        setRewardUnlocked(Boolean(data.rewardUnlocked));

        setRewardTransferred(Boolean(data.rewardTransferred));

        setShopClosed(Boolean(data.shopClosed));

        setBusinessDate(data.businessDate || '');

        setOpeningTime(data.openingTime || '');

        setClosingTime(data.closingTime || '');
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

  // =========================
  // Load Referral Code for Offer 2
  // =========================

  useEffect(() => {
    if (!shopOwner?.id) {
      return;
    }

    const loadReferralCode = async () => {
      try {
        const data = await fetchReferralCode(shopOwner.id);

        setReferralCode(data.referralCode || '');
      } catch (error) {
        console.error('Fetch referral code failed:', error);
      }
    };

    loadReferralCode();
  }, [shopOwner?.id]);

  // =========================
  // Load Referral Progress
  // =========================

  useEffect(() => {
    if (!shopOwner?.id) {
      setLoadingReferrals(false);
      setReferralError('Owner information not found.');
      return;
    }

    const loadReferralProgress = async () => {
      try {
        setLoadingReferrals(true);
        setReferralError('');

        const data = await fetchReferralProgress(shopOwner.id);

        setReferralProgress(data);
      } catch (error) {
        console.error('Fetch referral progress failed:', error);

        setReferralError(error.message || 'Failed to load referral progress.');
      } finally {
        setLoadingReferrals(false);
      }
    };

    loadReferralProgress();
  }, [shopOwner?.id]);

  // =========================
  // Copy Referral Code
  // =========================

  const handleCopyReferralCode = async () => {
    if (!referralCode) {
      return;
    }

    try {
      await navigator.clipboard.writeText(referralCode);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy referral code:', error);
    }
  };

  // =========================
  // Offer 1 progress message
  // =========================

  const getProgressMessage = () => {
    if (rewardTransferred) {
      return `Congratulations! ₹${rewardAmount.toFixed(
        2,
      )} has been transferred to your account.`;
    }

    if (shopClosed && rewardUnlocked) {
      return `Offer earned! ₹${rewardAmount.toFixed(
        2,
      )} will be transferred to your account.`;
    }

    if (shopClosed && !rewardUnlocked) {
      return `Business day completed. You needed ${targetOrders} orders to earn the offer.`;
    }

    if (completedOrders >= targetOrders) {
      return `Offer unlocked! ₹${rewardAmount.toFixed(
        2,
      )} will be yours after the business day closes.`;
    }

    if (remainingOrders === 1) {
      return 'ONE MORE ORDER! Complete it to unlock the offer.';
    }

    if (remainingOrders <= 5) {
      return `So close! Just ${remainingOrders} more orders to go.`;
    }

    if (completedOrders > 0) {
      return `Great start! ${remainingOrders} more orders to go.`;
    }

    return 'Your journey starts here. Complete your first order!';
  };

  return (
    <main className="owner_offers">
      <OffersHeader />

      {/* =========================
          OFFER 1 — ORDER REWARD
          ========================= */}

      <OrderRewardCard
        loadingOrders={loadingOrders}
        completedOrders={completedOrders}
        targetOrders={targetOrders}
        progress={progress}
        remainingOrders={remainingOrders}
        rewardUnlocked={rewardUnlocked}
        rewardTransferred={rewardTransferred}
        rewardAmount={rewardAmount}
        rewardRate={rewardRate}
        shopClosed={shopClosed}
        businessDate={businessDate}
        openingTime={openingTime}
        closingTime={closingTime}
        ordersError={ordersError}
        getProgressMessage={getProgressMessage}
        navigate={navigate}
      />

      {/* =========================
          OFFER 2 — REFER & EARN
          ========================= */}

      <ReferralRewardCard
        referralCode={referralCode}
        copied={copied}
        handleCopyReferralCode={handleCopyReferralCode}
        referralProgress={referralProgress}
        loadingReferrals={loadingReferrals}
        referralError={referralError}
      />
    </main>
  );
}

export default Offers;
