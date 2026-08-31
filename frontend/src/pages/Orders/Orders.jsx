import './Orders.css';

import { useNavigate } from 'react-router-dom';
import { useOrder } from '../../context/OrderContext';

function Orders() {
  const navigate = useNavigate();

  const { orders } = useOrder();

  if (orders.length === 0) {
    return (
      <main className="orders_empty">
        <h1>No Orders Yet</h1>

        <p>Your completed orders will appear here.</p>

        <button onClick={() => navigate('/')}>Start Shopping</button>
      </main>
    );
  }

  return (
    <main className="orders">
      <section className="orders_header">
        <h1>My Orders</h1>

        <p>{orders.length} orders</p>
      </section>

      <section className="orders_list">
        {orders.map((order) => (
          <div className="order_card" key={order.orderId}>
            <div className="order_card_header">
              <div>
                <span>Order ID</span>
                <strong>{order.orderId}</strong>
              </div>

              <span className="order_status">{order.status}</span>
            </div>

            <div className="order_shop">
              <span>Shop</span>

              <strong>{order.shopName}</strong>
            </div>

            <div className="order_info">
              <span>{order.totalItems} items</span>

              <span>
                {order.orderType === 'delivery' ? 'Delivery' : 'Pickup'}
              </span>

              <strong>₹{order.totalPrice}</strong>
            </div>

            <button
              className="track_order_button"
              onClick={() => navigate(`/delivery-status/${order.orderId}`)}
            >
              View Order
            </button>
          </div>
        ))}
      </section>
    </main>
  );
}

export default Orders;
