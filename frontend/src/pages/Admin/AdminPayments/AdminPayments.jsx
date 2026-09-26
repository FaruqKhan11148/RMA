import './AdminPayments.css';

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import PaymentsHeader from './components/PaymentsHeader';
import PaymentStats from './components/PaymentStats';
import PaymentFilters from './components/PaymentFilters';
import PaymentsTable from './components/PaymentsTable';
import PaymentDetailsModal from './components/PaymentDetailsModal';

import { filterPayments } from './utils/paymentFilters';

function AdminPayments() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('ALL');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('ALL');

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // =========================
  // FETCH PAYMENTS
  // =========================

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(
          'https://rma-backend-bo4a.onrender.com/api/admin/orders',
          {
            method: 'GET',
            credentials: 'include',
          },
        );

        if (response.status === 401) {
          navigate('/admin/login');
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch payment data');
        }

        setOrders(data.orders || []);
      } catch (error) {
        console.error('Admin payments fetch error:', error);
        setError(error.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [navigate]);

  // =========================
  // PAYMENT SUMMARY
  // =========================

  const totalPayments = orders.length;

  const paidPayments = orders.filter((order) => order.paymentStatus === 'Paid');

  const pendingPayments = orders.filter(
    (order) => order.paymentStatus === 'Pending',
  );

  const failedPayments = orders.filter(
    (order) => order.paymentStatus === 'Failed',
  );

  const refundedPayments = orders.filter(
    (order) => order.paymentStatus === 'Refunded',
  );

  const totalPaidAmount = paidPayments.reduce(
    (total, order) => total + Number(order.totalPrice || 0),
    0,
  );

  const totalPendingAmount = pendingPayments.reduce(
    (total, order) => total + Number(order.totalPrice || 0),
    0,
  );

  const totalRefundedAmount = refundedPayments.reduce(
    (total, order) => total + Number(order.totalPrice || 0),
    0,
  );

  const onlinePayments = orders.filter(
    (order) => order.paymentMethod === 'ONLINE',
  ).length;

  const codPayments = orders.filter(
    (order) => order.paymentMethod === 'COD',
  ).length;

  // =========================
  // FILTER PAYMENTS
  // =========================

  const filteredOrders = useMemo(() => {
    return filterPayments(
      orders,
      search,
      paymentStatusFilter,
      paymentMethodFilter,
    );
  }, [orders, search, paymentStatusFilter, paymentMethodFilter]);

  // =========================
  // OPEN PAYMENT DETAILS
  // =========================

  const handleViewPayment = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  return (
    <div className="admin-payments-page">
      <PaymentsHeader onBack={() => navigate('/admin/dashboard')} />

      {error && <div className="admin-payments-error">{error}</div>}

      <PaymentStats
        totalPayments={totalPayments}
        paidPayments={paidPayments}
        pendingPayments={pendingPayments}
        failedPayments={failedPayments}
        refundedPayments={refundedPayments}
        totalPaidAmount={totalPaidAmount}
        totalPendingAmount={totalPendingAmount}
        totalRefundedAmount={totalRefundedAmount}
        onlinePayments={onlinePayments}
        codPayments={codPayments}
      />

      <PaymentFilters
        search={search}
        setSearch={setSearch}
        paymentStatusFilter={paymentStatusFilter}
        setPaymentStatusFilter={setPaymentStatusFilter}
        paymentMethodFilter={paymentMethodFilter}
        setPaymentMethodFilter={setPaymentMethodFilter}
      />

      <PaymentsTable
        loading={loading}
        filteredOrders={filteredOrders}
        onViewPayment={handleViewPayment}
      />

      {showModal && (
        <PaymentDetailsModal
          selectedOrder={selectedOrder}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

export default AdminPayments;
