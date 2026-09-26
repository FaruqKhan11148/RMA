import './OwnerDashboard.css';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import OwnerDashboardHeader from './components/OwnerDashboardHeader';
import OwnerStats from './components/OwnerStats';
import ManageOrdersCard from './components/ManageOrdersCard';
import NewOrders from './components/NewOrders';
import RecentOrders from './components/RecentOrders';
import RejectOrderModal from './components/RejectOrderModal';

import {
  fetchOwnerOrders,
  fetchOwnerProfile,
  updateOrderStatusApi,
  rejectOrderApi,
} from './utils/ownerDashboardApi';

import {
  getTodayOrders,
  getPendingOrders,
  getCompletedOrders,
  getTotalRevenue,
} from './utils/ownerDashboardHelpers';

import {
  requestOwnerNotificationPermission,
  listenForOwnerNotifications,
} from '../../../firebase/ownerNotifications';

function OwnerDashboard() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRejectOrder, setSelectedRejectOrder] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionDescription, setRejectionDescription] = useState('');
  const [rejectingOrder, setRejectingOrder] = useState(false);

  const [shopOwner, setShopOwner] = useState(() => {
    const ownerData = localStorage.getItem('rma_owner');

    return ownerData ? JSON.parse(ownerData) : null;
  });

  useEffect(() => {
    if (!shopOwner) {
      navigate('/owner/login');
      return;
    }

    const loadOrders = async () => {
      try {
        setLoading(true);
        setError('');

        const data = await fetchOwnerOrders(shopOwner.id);

        setOrders(data.orders);
      } catch (error) {
        console.error('Fetch owner orders failed:', error);
        setError(error.message || 'Unable to connect to server');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [shopOwner, navigate]);

  useEffect(() => {
    if (!shopOwner?.id) {
      return;
    }

    const token = localStorage.getItem('rma_owner_token');

    if (!token) {
      navigate('/owner/login');
      return;
    }

    const fetchOwner = async () => {
      try {
        const owner = await fetchOwnerProfile(token);

        if (!owner) {
          return;
        }

        setShopOwner(owner);
        localStorage.setItem('rma_owner', JSON.stringify(owner));
      } catch (error) {
        console.error('Fetch owner status failed:', error);
      }
    };

    fetchOwner();

    const intervalId = setInterval(fetchOwner, 30000);

    return () => {
      clearInterval(intervalId);
    };
  }, [navigate, shopOwner?.id]);

  useEffect(() => {
    if (!shopOwner?.id) {
      return;
    }

    const token = localStorage.getItem('rma_owner_token');

    if (!token) {
      return;
    }

    let isActive = true;

    const setupOwnerNotifications = async () => {
      const ownerFcmToken = await requestOwnerNotificationPermission(token);

      if (!isActive) {
        return;
      }

      if (ownerFcmToken) {
        console.log('OWNER NOTIFICATION SETUP COMPLETED.');
      }
    };

    setupOwnerNotifications();

    return () => {
      isActive = false;
    };
  }, [shopOwner?.id]);

  useEffect(() => {
    if (!shopOwner?.id) {
      return;
    }

    let unsubscribe;
    let isActive = true;

    const setupNotificationListener = async () => {
      const cleanup = await listenForOwnerNotifications((payload) => {
        if (!isActive) {
          return;
        }

        const title = payload.notification?.title || 'RMA Notification';

        const message =
          payload.notification?.body || 'You have a new notification.';

        alert(`${title}\n\n${message}`);
      });

      if (!isActive) {
        if (cleanup) {
          cleanup();
        }

        return;
      }

      unsubscribe = cleanup;
    };

    setupNotificationListener();

    return () => {
      isActive = false;

      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [shopOwner?.id]);

  if (!shopOwner) {
    return null;
  }

  if (loading) {
    return (
      <main className="owner_dashboard">
        <h1>Loading orders...</h1>
      </main>
    );
  }

  if (error) {
    return (
      <main className="owner_dashboard">
        <h1>Unable to load orders</h1>

        <p>{error}</p>
      </main>
    );
  }

  const openRejectModal = (order) => {
    setSelectedRejectOrder(order);
    setRejectionReason('');
    setRejectionDescription('');
    setShowRejectModal(true);
  };

  const handleRejectOrder = async () => {
    if (!selectedRejectOrder) {
      return;
    }

    if (!rejectionReason) {
      alert('Please select a rejection reason.');
      return;
    }

    try {
      setRejectingOrder(true);

      const data = await rejectOrderApi({
        orderId: selectedRejectOrder.orderId,
        rejectionReason,
        rejectionDescription,
      });

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.orderId === selectedRejectOrder.orderId ? data.order : order,
        ),
      );

      setShowRejectModal(false);
      setSelectedRejectOrder(null);
      setRejectionReason('');
      setRejectionDescription('');
    } catch (error) {
      console.error('Reject order failed:', error);

      alert(error.message || 'Unable to connect to server');
    } finally {
      setRejectingOrder(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const data = await updateOrderStatusApi(orderId, status);

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.orderId === orderId
            ? {
                ...order,
                status: data.order.status,
              }
            : order,
        ),
      );

      console.log('Order status updated:', data.order);
    } catch (error) {
      console.error('Update order status failed:', error);

      alert(error.message || 'Unable to connect to server');
    }
  };

  const todayOrders = getTodayOrders(orders);

  const pendingOrders = getPendingOrders(todayOrders);

  const completedOrders = getCompletedOrders(todayOrders);

  const totalRevenue = getTotalRevenue(completedOrders);

  return (
    <main className="owner_dashboard">
      <OwnerDashboardHeader shopOwner={shopOwner} navigate={navigate} />

      <OwnerStats
        todayOrders={todayOrders}
        pendingOrders={pendingOrders}
        completedOrders={completedOrders}
        totalRevenue={totalRevenue}
      />

      <ManageOrdersCard navigate={navigate} />

      <NewOrders
        pendingOrders={pendingOrders}
        openRejectModal={openRejectModal}
        updateOrderStatus={updateOrderStatus}
      />

      <RecentOrders orders={orders} />
      {showRejectModal && selectedRejectOrder && (
        <RejectOrderModal
          showRejectModal={showRejectModal}
          selectedRejectOrder={selectedRejectOrder}
          rejectingOrder={rejectingOrder}
          rejectionReason={rejectionReason}
          rejectionDescription={rejectionDescription}
          setShowRejectModal={setShowRejectModal}
          setSelectedRejectOrder={setSelectedRejectOrder}
          setRejectionReason={setRejectionReason}
          setRejectionDescription={setRejectionDescription}
          handleRejectOrder={handleRejectOrder}
        />
      )}
    </main>
  );
}

export default OwnerDashboard;
