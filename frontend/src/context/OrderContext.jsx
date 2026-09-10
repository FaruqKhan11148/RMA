import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';

const OrderContext = createContext();

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);

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
    try {
      const guestId = getGuestId();

      const response = await fetch(
        `https://rma-backend-bo4a.onrender.com/api/orders/guest/${guestId}`,
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load guest orders');
      }

      setOrders(data.orders || []);

      return data.orders || [];
    } catch (error) {
      console.error('Get guest orders failed:', error);
      throw error;
    }
  }, [getGuestId]);

  // CREATE ORDER IN BACKEND
  const createOrder = async (orderData) => {
    try {
      const guestId = getGuestId();

      const response = await fetch(
        'https://rma-backend-bo4a.onrender.com/api/orders',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            ...orderData,
            guestId,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create order');
      }

      setOrders((currentOrders) => [data.order, ...currentOrders]);

      return data.order;
    } catch (error) {
      console.error('Create order failed:', error);

      throw error;
    }
  };

  // UPDATE ORDER STATUS IN BACKEND
  const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await fetch(
        `https://rma-backend-bo4a.onrender.com/api/orders/${orderId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status,
          }),
        },
      );

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
