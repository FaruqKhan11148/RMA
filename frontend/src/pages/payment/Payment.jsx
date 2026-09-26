import './Payment.css';

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useOrder } from '../../context/OrderContext';

import PaymentEmpty from './components/PaymentEmpty';
import PaymentHeader from './components/PaymentHeader';
import PaymentOrder from './components/PaymentOrder';
import PaymentAmount from './components/PaymentAmount';
import PaymentMethod from './components/PaymentMethod';
import PaymentInfo from './components/PaymentInfo';
import PaymentButton from './components/PaymentButton';

import { createPayUPayment, submitPayUPayment } from './utils/paymentApi';

function Payment() {
  const navigate = useNavigate();
  const { orderId } = useParams();

  const { orders } = useOrder();

  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [loading, setLoading] = useState(false);

  const order = orders.find((item) => item.orderId === orderId);

  if (!order) {
    return <PaymentEmpty onGoHome={() => navigate('/')} />;
  }

  const handlePayment = async () => {
    try {
      setLoading(true);

      const { paymentUrl, payment } = await createPayUPayment(order.orderId);

      submitPayUPayment(paymentUrl, payment);
    } catch (error) {
      console.error('PayU payment start failed:', error);

      alert(error.message || 'Unable to start payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="payment">
      <PaymentHeader />

      <PaymentOrder order={order} />

      <PaymentAmount amount={order.totalPrice} />

      <PaymentMethod
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
      />

      <PaymentInfo />

      <PaymentButton
        loading={loading}
        amount={order.totalPrice}
        onPayment={handlePayment}
      />
    </main>
  );
}

export default Payment;
