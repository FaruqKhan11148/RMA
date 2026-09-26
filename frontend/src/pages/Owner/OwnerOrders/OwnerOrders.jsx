import './OwnerOrders.css';

import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import OwnerOrdersHeader from './components/OwnerOrdersHeader';
import OwnerOrderFilters from './components/OwnerOrderFilters';
import OwnerOrderCard from './components/OwnerOrderCard';
import OwnerOrderDetails from './components/OwnerOrderDetails';
import DeliveryAssignmentModal from './components/DeliveryAssignmentModal';
import OwnerOrdersLoading from './components/OwnerOrdersLoading';
import OwnerOrdersError from './components/OwnerOrdersError';
import RejectionReasonModal from './components/RejectionReasonModal';

import {
  fetchOwnerOrders,
  updateOwnerOrderStatus,
  fetchDeliveryPartners,
} from './utils/ownerOrdersApi';

function OwnerOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [selectedDeliveryOrder, setSelectedDeliveryOrder] = useState(null);

  const [deliveryAssignmentType, setDeliveryAssignmentType] = useState('SHOP');

  const [deliveryPartners, setDeliveryPartners] = useState({
    SHOP: [],
    RMA: [],
  });

  const [selectedDeliveryPersonId, setSelectedDeliveryPersonId] = useState('');

  const [loadingDeliveryPartners, setLoadingDeliveryPartners] = useState(false);

  const [assigningDelivery, setAssigningDelivery] = useState(false);

  const ownerData = localStorage.getItem('rma_owner');

  const shopOwner = useMemo(() => {
    return ownerData ? JSON.parse(ownerData) : null;
  }, [ownerData]);

  const filters = [
    'All',
    'Pending',
    'Accepted',
    'Preparing',
    'Ready',
    'OutForDelivery',
    'Completed',
    'Rejected',
  ];

  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [selectedRejectionOrder, setSelectedRejectionOrder] = useState(null);

  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionDescription, setRejectionDescription] = useState('');

  const [rejectingOrder, setRejectingOrder] = useState(false);

  // Redirect if owner is not logged in
  useEffect(() => {
    if (!shopOwner) {
      navigate('/owner/login');
    }
  }, [shopOwner, navigate]);

  // GET OWNER ORDERS
  useEffect(() => {
    if (!shopOwner) {
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError('');

        const data = await fetchOwnerOrders(shopOwner.id);

        setOrders(data.orders);
      } catch (error) {
        console.error('Fetch owner orders failed:', error);

        setError('Unable to connect to server');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [shopOwner]);

  const openRejectionModal = (order) => {
    setSelectedRejectionOrder(order);
    setRejectionReason('');
    setRejectionDescription('');
    setShowRejectionModal(true);
  };

  const confirmRejectOrder = async () => {
    if (!selectedRejectionOrder) {
      return;
    }

    if (!rejectionReason.trim()) {
      alert('Please select a rejection reason');
      return;
    }

    try {
      setRejectingOrder(true);

      const data = await updateOwnerOrderStatus(
        selectedRejectionOrder.orderId,
        'Rejected',
        {
          rejectionReason: rejectionReason.trim(),
          rejectionDescription: rejectionDescription.trim(),
        },
      );

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.orderId === selectedRejectionOrder.orderId
            ? {
                ...order,
                status: data.order.status,
                rejectionReason: data.order.rejectionReason,
                rejectionDescription: data.order.rejectionDescription,
              }
            : order,
        ),
      );

      setShowRejectionModal(false);
      setSelectedRejectionOrder(null);
      setRejectionReason('');
      setRejectionDescription('');

      console.log('Order rejected:', data.order);
    } catch (error) {
      console.error('Reject order failed:', error);

      alert(error.message || 'Unable to reject order');
    } finally {
      setRejectingOrder(false);
    }
  };

  // UPDATE ORDER STATUS
  const handleStatusChange = async (orderId, status) => {
    try {
      const data = await updateOwnerOrderStatus(orderId, status);

      // Update the order immediately in the UI
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

      alert('Unable to connect to server');
    }
  };

  const openDeliveryAssignment = async (order) => {
    try {
      setSelectedDeliveryOrder(order);
      setDeliveryAssignmentType('SHOP');
      setSelectedDeliveryPersonId('');
      setDeliveryPartners({
        SHOP: [],
        RMA: [],
      });
      setShowDeliveryModal(true);
      setLoadingDeliveryPartners(true);

      const ownerToken = localStorage.getItem('rma_owner_token');

      const data = await fetchDeliveryPartners(order.orderId, ownerToken);

      setDeliveryPartners({
        SHOP: data.shopPartners || [],
        RMA: data.rmaPartners || [],
      });
    } catch (error) {
      console.error('Load delivery partners failed:', error);

      alert('Unable to load delivery partners');
      setShowDeliveryModal(false);
    } finally {
      setLoadingDeliveryPartners(false);
    }
  };

  const assignDeliveryPartner = async () => {
    if (!selectedDeliveryOrder) {
      return;
    }

    if (!selectedDeliveryPersonId) {
      alert('Please select a delivery partner');
      return;
    }

    try {
      setAssigningDelivery(true);

      const data = await updateOwnerOrderStatus(
        selectedDeliveryOrder.orderId,
        'OutForDelivery',
        {
          deliveryAssignmentType,
          deliveryPersonId: selectedDeliveryPersonId,
        },
      );

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.orderId === selectedDeliveryOrder.orderId
            ? {
                ...order,
                status: data.order.status,
                deliveryAssignmentType: data.order.deliveryAssignmentType,
                deliveryPersonId: data.order.deliveryPersonId,
              }
            : order,
        ),
      );

      setShowDeliveryModal(false);
      setSelectedDeliveryOrder(null);
      setSelectedDeliveryPersonId('');
      setDeliveryPartners({
        SHOP: [],
        RMA: [],
      });

      console.log('Delivery partner assigned:', data.order);
    } catch (error) {
      console.error('Assign delivery partner failed:', error);

      alert('Unable to connect to server');
    } finally {
      setAssigningDelivery(false);
    }
  };

  const filteredOrders =
    activeFilter === 'All'
      ? orders
      : orders.filter((order) => order.status === activeFilter);

  const getCount = (status) => {
    if (status === 'All') {
      return orders.length;
    }

    return orders.filter((order) => order.status === status).length;
  };

  if (!shopOwner) {
    return null;
  }

  if (loading) {
    return <OwnerOrdersLoading />;
  }

  if (error) {
    return <OwnerOrdersError error={error} />;
  }

  return (
    <main className="owner_orders">
      {selectedOrder ? (
        <OwnerOrderDetails
          order={selectedOrder}
          setSelectedOrder={setSelectedOrder}
        />
      ) : (
        <>
          <OwnerOrdersHeader navigate={navigate} />

          <OwnerOrderFilters
            filters={filters}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            getCount={getCount}
          />

          {/* ORDERS */}

          <section className="owner_orders_list">
            {filteredOrders.length === 0 ? (
              <div className="owner_no_orders">
                <h2>No {activeFilter.toLowerCase()} orders</h2>

                <p>There are currently no orders in this category.</p>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <OwnerOrderCard
                  key={order.orderId}
                  order={order}
                  setSelectedOrder={setSelectedOrder}
                  handleStatusChange={handleStatusChange}
                  openDeliveryAssignment={openDeliveryAssignment}
                  openRejectionModal={openRejectionModal}
                />
              ))
            )}
          </section>
        </>
      )}
      <DeliveryAssignmentModal
        showDeliveryModal={showDeliveryModal}
        selectedDeliveryOrder={selectedDeliveryOrder}
        deliveryAssignmentType={deliveryAssignmentType}
        setDeliveryAssignmentType={setDeliveryAssignmentType}
        deliveryPartners={deliveryPartners}
        selectedDeliveryPersonId={selectedDeliveryPersonId}
        setSelectedDeliveryPersonId={setSelectedDeliveryPersonId}
        loadingDeliveryPartners={loadingDeliveryPartners}
        assigningDelivery={assigningDelivery}
        setShowDeliveryModal={setShowDeliveryModal}
        assignDeliveryPartner={assignDeliveryPartner}
      />

      <RejectionReasonModal
        showRejectionModal={showRejectionModal}
        selectedRejectionOrder={selectedRejectionOrder}
        rejectionReason={rejectionReason}
        setRejectionReason={setRejectionReason}
        rejectionDescription={rejectionDescription}
        setRejectionDescription={setRejectionDescription}
        rejectingOrder={rejectingOrder}
        setShowRejectionModal={setShowRejectionModal}
        confirmRejectOrder={confirmRejectOrder}
      />
    </main>
  );
}

export default OwnerOrders;
