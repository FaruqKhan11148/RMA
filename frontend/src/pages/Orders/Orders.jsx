import './Orders.css';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrder } from '../../context/OrderContext';

import OrdersEmpty from './components/OrdersEmpty';
import OrderCard from './components/OrderCard';
import OrdersHeader from './components/OrdersHeader';
import OrderSheet from './components/OrderSheet';

import { fetchCustomerOrders } from './utils/ordersApi';

function Orders() {
  const navigate = useNavigate();

  const { getGuestOrders } = useOrder();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderSheet, setShowOrderSheet] = useState(false);

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

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setShowOrderSheet(true);
  };

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

  if (loading || orders.length === 0) {
    return (
      <OrdersEmpty loading={loading} onStartOrdering={() => navigate('/')} />
    );
  }

  return (
    <>
      <main className="orders">
        <OrdersHeader />

        <div className="orders_list">
          {orders.map((order) => (
            <OrderCard
              key={order.orderId}
              order={order}
              onOrderClick={handleOrderClick}
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
