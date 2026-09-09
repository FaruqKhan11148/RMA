import './Checkout.css';
import MapPicker from '../../components/map/MapPicker';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useCart } from '../../context/CartContext';
import { useOrder } from '../../context/OrderContext';

function Checkout() {
  const navigate = useNavigate();

  const { cartItems,   totalPrice, clearCart } = useCart();
  const { createOrder } = useOrder();

  const [orderType, setOrderType] = useState('delivery');
  const [paymentMethod, setPaymentMethod] = useState('COD');

  // Customer's selected map location
  const [deliveryLocation, setDeliveryLocation] = useState(null);

  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
    address: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;

    setCustomer((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError('');

      // MongoDB _id of the shop owner
      const ownerId = cartItems[0].ownerId;

      // Convert cart items into Order.js format
      const items = cartItems.map((item) => ({
        productId: item.product.productId,
        productName: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
      }));

      // Require location for delivery orders
      if (orderType === 'delivery' && !deliveryLocation) {
        setError('Please select your delivery location on the map.');
        setLoading(false);
        return;
      }

      const orderData = {
        ownerId,
        customer,
        orderType,
        items,
        paymentMethod,
        deliveryLocation: orderType === 'delivery' ? deliveryLocation : null,
      };

      console.log('Sending Order:', orderData);

      // Create order in backend
      const order = await createOrder(orderData);

      console.log('BACKEND CALCULATED ORDER:', {
        subtotal: order.subtotal,
        deliveryDistance: order.deliveryDistance,
        deliveryCharge: order.deliveryCharge,
        rmaFee: order.rmaFee,
        ownerAmount: order.ownerAmount,
        totalPrice: order.totalPrice,
      });

      console.log('Order Created:', order);

      // ONLINE → payment page
      if (paymentMethod === 'ONLINE') {
        navigate(`/payment/${order.orderId}`);
      } else {
        // COD → clear cart immediately
        clearCart();

        navigate(`/delivery-status/${order.orderId}`);
      }
    } catch (error) {
      console.error('Create order failed:', error);

      setError(error.message || 'Unable to create order');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <main className="checkout_empty">
        <h1>Your cart is empty</h1>

        <button onClick={() => navigate('/')}>Go Home</button>
      </main>
    );
  }

  return (
    <main className="checkout">
      {/* DELIVERY MAP */}

      {orderType === 'delivery' && (
        <MapPicker
          onLocationSelect={(location) => {
            console.log('Selected Delivery Location:', location);

            setDeliveryLocation(location);
          }}
        />
      )}

      {/* HEADER */}

      <section className="checkout_header">
        <h1>Checkout</h1>

        <p>Complete your details to place the order.</p>
      </section>

      {/* ORDER TYPE */}

      <section className="checkout_section">
        <h2>Order Type</h2>

        <div className="order_type">
          {cartItems[0].shopDelivery && (
            <button
              type="button"
              className={orderType === 'delivery' ? 'selected' : ''}
              onClick={() => setOrderType('delivery')}
            >
              Delivery
            </button>
          )}

          {cartItems[0].shopPickup && (
            <button
              type="button"
              className={orderType === 'pickup' ? 'selected' : ''}
              onClick={() => setOrderType('pickup')}
            >
              Pickup
            </button>
          )}
        </div>
      </section>

      {/* PAYMENT METHOD */}

      <section className="checkout_section">
        <h2>Payment Method</h2>

        <div className="payment_method">
          <button
            type="button"
            className={paymentMethod === 'COD' ? 'selected' : ''}
            onClick={() => setPaymentMethod('COD')}
          >
            Cash on Delivery
          </button>

          <button
            type="button"
            className={paymentMethod === 'ONLINE' ? 'selected' : ''}
            onClick={() => setPaymentMethod('ONLINE')}
          >
            Online Payment
          </button>
        </div>
      </section>

      {/* CUSTOMER DETAILS */}

      <section className="checkout_section">
        <h2>Your Details</h2>

        <form onSubmit={handleSubmit}>
          <label>
            Name
            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              value={customer.name}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Mobile Number
            <input
              type="tel"
              name="phone"
              placeholder="Enter mobile number"
              value={customer.phone}
              onChange={handleChange}
              required
            />
          </label>

          {orderType === 'delivery' && (
            <label>
              Delivery Address
              <textarea
                name="address"
                placeholder="Enter your delivery address"
                value={customer.address}
                onChange={handleChange}
                required
              />
            </label>
          )}

          {error && <p className="checkout_error">{error}</p>}

          <button
            className="place_order_button"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Placing Order...' : 'Continue'}
          </button>
        </form>
      </section>

      {/* ORDER SUMMARY */}

      <section className="checkout_section">
        <h2>Order Summary</h2>

        <div className="summary_shop">
          <span>Shop</span>

          <strong>{cartItems[0].shopName}</strong>
        </div>

        {cartItems.map((item) => (
          <div className="summary_item" key={item.product.productId}>
            <span>
              {item.product.name} × {item.quantity}
            </span>

            <strong>₹{item.product.price * item.quantity}</strong>
          </div>
        ))}

        <div className="summary_total">
          <span>Total</span>

          <strong>₹{totalPrice}</strong>
        </div>
      </section>
    </main>
  );
}

export default Checkout;
