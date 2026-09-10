import './Payment.css';

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useOrder } from '../../context/OrderContext';

function Payment() {
  const navigate = useNavigate();
  const { orderId } = useParams();

  const { orders } = useOrder();

  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [loading, setLoading] = useState(false);

  const order = orders.find((item) => item.orderId === orderId);

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

      // 1. Ask our backend to create the PayU payment.
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

      console.log('PayU Payment Data:', data);

      const { paymentUrl, payment } = data;

      if (!paymentUrl || !payment) {
        alert('Invalid PayU payment response');

        return;
      }

      // 2. Create a temporary HTML form.
      const form = document.createElement('form');

      form.method = 'POST';
      form.action = paymentUrl;

      // PayU should receive the payment request as a
      // normal application/x-www-form-urlencoded form.
      form.style.display = 'none';

      // 3. Add all PayU payment fields.
      const paymentFields = {
        key: payment.key,

        txnid: payment.txnid,

        amount: payment.amount,

        productinfo: payment.productinfo,

        firstname: payment.firstname,

        email: payment.email,

        phone: payment.phone,

        surl: payment.surl,

        furl: payment.furl,

        hash: payment.hash,
      };

      Object.entries(paymentFields).forEach(([name, value]) => {
        const input = document.createElement('input');

        input.type = 'hidden';

        input.name = name;

        input.value = value ?? '';

        form.appendChild(input);
      });

      // 4. Add the form to the page.
      document.body.appendChild(form);

      console.log('Redirecting to PayU Test Checkout...');

      // 5. Submit the form to PayU.
      form.submit();

      // The browser is now leaving our RMA page
      // and going to PayU.
    } catch (error) {
      console.error('PayU payment start failed:', error);

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

      {/* 
      <button
        className="back_button"
        onClick={() =>
          navigate(
            `/delivery-status/${order.orderId}`,
          )
        }
      >
        Pay Later
      </button>
      */}
    </main>
  );
}

export default Payment;
