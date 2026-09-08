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
  const [loading, setLoading] = useState(false);

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

  const handlePayment = async () => {
    try {
      setLoading(true);

      // 1. Create Razorpay order from backend
      const response = await fetch(
        'https://rma-backend-bo4a.onrender.com/api/payments/create-order',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId: order.orderId,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || 'Unable to create payment');
        return;
      }

      const razorpayOrder = data.order;

      const razorpayKey = process.env.REACT_APP_RAZORPAY_KEY_ID;

      console.log('Razorpay Key:', razorpayKey);

      const options = {
        key: razorpayKey,

        amount: razorpayOrder.amount,

        currency: razorpayOrder.currency,

        name: 'RMA',

        description: `Order ${order.orderId}`,

        order_id: razorpayOrder.id,

        prefill: {
          name: order.customer.name,
          contact: order.customer.phone,
        },

        theme: {
          color: '#ff4d4f',
        },

        handler: async function (response) {
          try {
            // 3. Verify payment
            const verifyResponse = await fetch(
              'https://rma-backend-bo4a.onrender.com/api/payments/verify',
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  orderId: order.orderId,

                  razorpay_order_id: response.razorpay_order_id,

                  razorpay_payment_id: response.razorpay_payment_id,

                  razorpay_signature: response.razorpay_signature,

                  onlinePaymentMethod: paymentMethod,
                }),
              },
            );

            const verifyData = await verifyResponse.json();

            if (!verifyResponse.ok) {
              alert(verifyData.message || 'Payment verification failed');

              return;
            }

            // 4. Payment success
            clearCart();

            navigate(`/delivery-status/${order.orderId}`);
          } catch (error) {
            console.error(error);

            alert('Payment verification failed');
          }
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.open();
    } catch (error) {
      console.error(error);

      alert('Unable to start payment');
    } finally {
      setLoading(false);
    }
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

      <button className="pay_button" onClick={handlePayment} disabled={loading}>
        {loading ? 'Loading Payment...' : `Pay ₹${order.totalPrice}`}
      </button>

      {/* <button
        className="back_button"
        onClick={() => navigate(`/delivery-status/${order.orderId}`)}
      >
        Pay Later
      </button> */}
    </main>
  );
}

export default Payment;
