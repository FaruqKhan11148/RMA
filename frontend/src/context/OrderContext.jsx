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

      console.log('[OrderContext] Guest ID:', guestId);

      const url = `https://rma-backend-bo4a.onrender.com/api/orders/guest/${guestId}`;

      console.log('[OrderContext] GET guest orders URL:', url);

      const response = await fetch(url);

      console.log('[OrderContext] Guest orders status:', response.status);
      console.log('[OrderContext] Guest orders ok:', response.ok);

      const data = await response.json();

      console.log('[OrderContext] Guest orders response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load guest orders');
      }

      console.log('[OrderContext] Setting guest orders:', data.orders?.length);

      setOrders(data.orders || []);

      console.log('========== getGuestOrders END ==========');

      return data.orders || [];
    } catch (error) {
      console.error('[OrderContext] Get guest orders FAILED:', error);
      throw error;
    }
  }, [getGuestId]);

  // CREATE ORDER IN BACKEND
  const createOrder = async (orderData) => {
    console.log('========== createOrder START ==========');

    try {
      const guestId = getGuestId();

      console.log('[OrderContext] Creating order');
      console.log('[OrderContext] Guest ID:', guestId);
      console.log('[OrderContext] Order data:', orderData);

      const url = 'https://rma-backend-bo4a.onrender.com/api/orders';

      console.log('[OrderContext] POST URL:', url);

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

      console.log('[OrderContext] Create order status:', response.status);

      const data = await response.json();

      console.log('[OrderContext] Create order response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create order');
      }

      setOrders((currentOrders) => [data.order, ...currentOrders]);

      console.log('========== createOrder END ==========');

      return data.order;
    } catch (error) {
      console.error('[OrderContext] Create order FAILED:', error);
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
