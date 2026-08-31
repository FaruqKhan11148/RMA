import './Payment.css';

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useOrder } from '../../context/OrderContext';
import { useCart } from '../../context/CartContext';

function Payment() {
  const navigate = useNavigate();
  const { orderId } = useParams();

  const { orders } = useOrder();

  const [paymentMethod, setPaymentMethod] = useState('UPI');

  const order = orders.find((item) => item.orderId === orderId);
  const { clearCart } = useCart();

  if (!order) {
    return (
      <main className="payment_empty">
        <h1>Order not found</h1>

        <button onClick={() => navigate('/')}>Go Home</button>
      </main>
    );
  }

  const handlePayment = () => {
    // Temporary payment success simulation
    clearCart();

    navigate(`/delivery-status/${order.orderId}`);
  };

  return (
    <main className="payment">
      <section className="payment_header">
        <h1>Payment</h1>

        <p>Complete your payment to place the order.</p>
      </section>

      <section className="payment_order">
        <div>
          <span>Shop</span>
          <strong>{order.ownerId?.shopName || 'Shop'}</strong>
        </div>

        <div>
          <span>Order ID</span>
          <strong>{order.orderId}</strong>
        </div>
      </section>

      <section className="payment_amount">
        <p>Total Amount</p>

        <h2>₹{order.totalPrice}</h2>
      </section>

      <section className="payment_section">
        <h2>Payment Method</h2>

        <div className="payment_options">
          <button
            type="button"
            className={`payment_option ${
              paymentMethod === 'UPI' ? 'selected' : ''
            }`}
            onClick={() => setPaymentMethod('UPI')}
          >
            <div>
              <strong>UPI</strong>
              <p>Google Pay, PhonePe, Paytm and other UPI apps</p>
            </div>

            {paymentMethod === 'UPI' && <span>✓</span>}
          </button>

          <button
            type="button"
            className={`payment_option ${
              paymentMethod === 'CARD' ? 'selected' : ''
            }`}
            onClick={() => setPaymentMethod('CARD')}
          >
            <div>
              <strong>Debit / Credit Card</strong>
              <p>Pay securely using your bank card</p>
            </div>

            {paymentMethod === 'CARD' && <span>✓</span>}
          </button>

          <button
            type="button"
            className={`payment_option ${
              paymentMethod === 'RUPAY' ? 'selected' : ''
            }`}
            onClick={() => setPaymentMethod('RUPAY')}
          >
            <div>
              <strong>RuPay</strong>
              <p>Pay using a RuPay card</p>
            </div>

            {paymentMethod === 'RUPAY' && <span>✓</span>}
          </button>
        </div>
      </section>

      <section className="payment_info">
        <p>
          You will be redirected to the secure payment gateway to complete your
          payment.
        </p>
      </section>

      <button className="pay_button" onClick={handlePayment}>
        Pay ₹{order.totalPrice}
      </button>

      <button
        className="back_button"
        onClick={() => navigate(`/delivery-status/${order.orderId}`)}
      >
        Pay Later
      </button>
    </main>
  );
}

export default Payment;
