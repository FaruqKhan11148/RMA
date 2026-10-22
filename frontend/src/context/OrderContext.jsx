import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';

const API_URL =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/'
    : 'https://rma-backend-bo4a.onrender.com/';

const OrderContext = createContext();

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState([]);

  const [loading] = useState(true);

  const getGuestId = useCallback(() => {
    let guestId = localStorage.getItem('rma_guest_id');

    if (!guestId) {
      guestId = crypto.randomUUID();
      localStorage.setItem('rma_guest_id', guestId);
    }

    return guestId;
  }, []);

  useEffect(() => {
    getGuestId();
  }, [getGuestId]);

  const getGuestOrders = useCallback(async () => {
    console.log('========== getGuestOrders START ==========');

    try {
      const guestId = getGuestId();

      const url = `${API_URL}api/orders/guest/${guestId}`;

      const response = await fetch(url);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load guest orders');
      }

      setOrders(data.orders || []);

      return data.orders || [];
    } catch (error) {
      console.error('[OrderContext] Get guest orders FAILED:', error);
      throw error;
    }
  }, [getGuestId]);

  // CREATE ORDER IN BACKEND
  const createOrder = async (orderData) => {
    try {
      const guestId = getGuestId();
      const url = `${API_URL}api/orders`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...orderData,
          guestId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create order');
      }

      setOrders((currentOrders) => [data.order, ...currentOrders]);

      return data.order;
    } catch (error) {
      console.error('[OrderContext] Create order FAILED:', error);
      throw error;
    }
  };

  // UPDATE ORDER STATUS IN BACKEND
  const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await fetch(`${API_URL}api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update order status');
      }

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.orderId === orderId ? data.order : order,
        ),
      );

      return data.order;
    } catch (error) {
      console.error('Update order status failed:', error);

      throw error;
    }
  };

  const latestOrder = orders.length > 0 ? orders[0] : null;

  const value = {
    orders,
    loading,
    createOrder,
    latestOrder,
    updateOrderStatus,
    getGuestId,
    getGuestOrders,
  };

  return (
    <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
  );
}

export function useOrder() {
  return useContext(OrderContext);
}
