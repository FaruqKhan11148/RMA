import { createContext, useContext, useState, useEffect } from 'react';

const OrderContext = createContext();

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);

  // GET ALL ORDERS FROM BACKEND
  const fetchOrders = async () => {
    try {
      setLoading(true);

      const response = await fetch('http://localhost:5000/api/orders');

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch orders');
      }

      setOrders(data.orders);
    } catch (error) {
      console.error('Fetch orders failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // FETCH ORDERS WHEN APP STARTS
  useEffect(() => {
    fetchOrders();
  }, []);

  // CREATE ORDER IN BACKEND
  const createOrder = async (orderData) => {
    try {
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(orderData),
      });

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
        `http://localhost:5000/api/orders/${orderId}/status`,
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
    fetchOrders,
  };

  return (
    <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
  );
}

export function useOrder() {
  return useContext(OrderContext);
}
