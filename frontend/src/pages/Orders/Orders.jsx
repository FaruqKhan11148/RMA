import './Orders.css';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrder } from '../../context/OrderContext';

import OrdersEmpty from './components/OrdersEmpty';
import OrderCard from './components/OrderCard';
import OrdersHeader from './components/OrdersHeader';
import OrderSheet from './components/OrderSheet';

import FlashMessage from '../../components/FlashMessage/FlashMessage';

import { fetchCustomerOrders, deleteCustomerOrders } from './utils/ordersApi';

const canDeleteOrder = (order) => {
  if (!order) {
    return false;
  }

  if (order.status === 'Completed') {
    return true;
  }

  if (order.status === 'Rejected' && order.refundStatus === 'Completed') {
    return true;
  }

  return false;
};

function Orders() {
  const navigate = useNavigate();

  const { getGuestOrders } = useOrder();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderSheet, setShowOrderSheet] = useState(false);

  const [flashMessage, setFlashMessage] = useState('');

  // ==============================
  // SELECTION STATE
  // ==============================

  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState([]);

  const [deleting, setDeleting] = useState(false);

  // ==============================
  // LOAD ORDERS
  // ==============================

  useEffect(() => {
    const loadOrders = async () => {
      console.log('========== ORDERS PAGE START ==========');

      try {
        setLoading(true);

        console.log('[Orders] Checking customer login...');

        const customerOrders = await fetchCustomerOrders();

        if (customerOrders !== null) {
          setOrders(customerOrders);
        } else {
          console.log('[Orders] Customer is NOT logged in');
          console.log('[Orders] Calling getGuestOrders()');

          const guestOrders = await getGuestOrders();

          console.log('[Orders] Guest orders received:', guestOrders);
          console.log('[Orders] Guest order count:', guestOrders?.length);

          setOrders(guestOrders);
        }
      } catch (error) {
        console.error('[Orders] LOAD FAILED:', error);

        setOrders([]);
      } finally {
        console.log('========== ORDERS PAGE END ==========');

        setLoading(false);
      }
    };

    loadOrders();
  }, [getGuestOrders]);

  // ==============================
  // ORDER CARD CLICK
  // ==============================

  const handleOrderClick = (order) => {
    // Selection mode → select/unselect order
    if (selectionMode) {
      if (!canDeleteOrder(order)) {
        if (order.status === 'Rejected') {
          window.alert(
            'This rejected order can be deleted only after the refund is completed.',
          );
        } else {
          window.alert('This order cannot be deleted until it is completed.');
        }

        return;
      }

      setSelectedOrders((currentSelected) => {
        if (currentSelected.includes(order.orderId)) {
          return currentSelected.filter((orderId) => orderId !== order.orderId);
        }

        return [...currentSelected, order.orderId];
      });

      return;
    }

    // Normal mode → open order sheet
    setSelectedOrder(order);
    setShowOrderSheet(true);
  };

  // ==============================
  // SELECT MODE
  // ==============================

  const handleSelect = () => {
    setSelectionMode(true);
    setSelectedOrders([]);
    setShowOrderSheet(false);
  };

  const handleCancelSelection = () => {
    setSelectionMode(false);
    setSelectedOrders([]);
  };

  // ==============================
  // SELECT ALL
  // ==============================

  const handleSelectAll = () => {
    const deletableOrders = orders.filter(canDeleteOrder);

    if (deletableOrders.length === 0) {
      window.alert(
        'No completed or refunded rejected orders are available to delete.',
      );

      return;
    }

    if (selectedOrders.length === deletableOrders.length) {
      setSelectedOrders([]);
      return;
    }

    setSelectedOrders(deletableOrders.map((order) => order.orderId));
  };

  // ==============================
  // DELETE SELECTED ORDERS
  // ==============================

  const handleDeleteSelected = async () => {
    if (selectedOrders.length === 0 || deleting) {
      return;
    }

    const confirmed = window.confirm(
      `Delete ${selectedOrders.length} ${
        selectedOrders.length === 1 ? 'order' : 'orders'
      }?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);

      const result = await deleteCustomerOrders(selectedOrders);

      console.log('[Orders] Deleted orders:', result);

      // Remove deleted orders immediately from UI
      setOrders((currentOrders) =>
        currentOrders.filter(
          (order) => !selectedOrders.includes(order.orderId),
        ),
      );

      setSelectedOrders([]);
      setSelectionMode(false);
    } catch (error) {
      console.error('[Orders] DELETE FAILED:', error);

      window.alert(error.message || 'Failed to delete orders');
    } finally {
      setDeleting(false);
    }
  };

  // ==============================
  // ORDER SHEET
  // ==============================

  const closeOrderSheet = () => {
    setShowOrderSheet(false);
  };

  const handleViewOrder = () => {
    if (!selectedOrder) {
      return;
    }

    setShowOrderSheet(false);

    navigate(`/delivery-status/${selectedOrder.orderId}`);
  };

  // ==============================
  // EMPTY STATE
  // ==============================

  if (loading || orders.length === 0) {
    return (
      <OrdersEmpty loading={loading} onStartOrdering={() => navigate('/')} />
    );
  }

  const deletableOrdersCount = orders.filter(canDeleteOrder).length;

  // ==============================
  // PAGE
  // ==============================

  return (
    <>
      <main className="orders">
        <OrdersHeader
          selectionMode={selectionMode}
          selectedCount={selectedOrders.length}
          totalOrders={deletableOrdersCount}
          deleting={deleting}
          onSelect={handleSelect}
          onCancelSelection={handleCancelSelection}
          onSelectAll={handleSelectAll}
          onDeleteSelected={handleDeleteSelected}
        />

        <div className="orders_list">
          {orders.map((order) => (
            <OrderCard
              key={order.orderId}
              order={order}
              onOrderClick={handleOrderClick}
              selectionMode={selectionMode}
              selected={selectedOrders.includes(order.orderId)}
              canDelete={canDeleteOrder(order)}
            />
          ))}
        </div>
      </main>

      <OrderSheet
        selectedOrder={selectedOrder}
        showOrderSheet={showOrderSheet}
        closeOrderSheet={closeOrderSheet}
        handleViewOrder={handleViewOrder}
      />
    </>
  );
}

export default Orders;
