import './AdminPayments.css';

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

        const response = await fetch('http://localhost:5000/api/admin/orders', {
          method: 'GET',
          credentials: 'include',
        });

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
    return orders.filter((order) => {
      const owner = order.ownerId || {};
      const customer = order.customer || {};

      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        !searchText ||
        order.orderId?.toLowerCase().includes(searchText) ||
        customer.name?.toLowerCase().includes(searchText) ||
        customer.phone?.toLowerCase().includes(searchText) ||
        owner.shopName?.toLowerCase().includes(searchText) ||
        owner.shopId?.toLowerCase().includes(searchText) ||
        order.paymentId?.toLowerCase().includes(searchText) ||
        order.paymentOrderId?.toLowerCase().includes(searchText);

      const matchesPaymentStatus =
        paymentStatusFilter === 'ALL' ||
        order.paymentStatus === paymentStatusFilter;

      const matchesPaymentMethod =
        paymentMethodFilter === 'ALL' ||
        order.paymentMethod === paymentMethodFilter;

      return matchesSearch && matchesPaymentStatus && matchesPaymentMethod;
    });
  }, [orders, search, paymentStatusFilter, paymentMethodFilter]);

  // =========================
  // HELPERS
  // =========================

  const formatDate = (date) => {
    if (!date) return '—';

    return new Date(date).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const formatAmount = (amount) => {
    return `₹${Number(amount || 0).toFixed(2)}`;
  };

  const getPaymentStatusClass = (status) => {
    switch (status) {
      case 'Paid':
        return 'payment-status-paid';

      case 'Failed':
        return 'payment-status-failed';

      case 'Refunded':
        return 'payment-status-refunded';

      case 'Pending':
      default:
        return 'payment-status-pending';
    }
  };

  const getPaymentMethodLabel = (order) => {
    if (order.paymentMethod === 'ONLINE') {
      return order.onlinePaymentMethod
        ? `ONLINE • ${order.onlinePaymentMethod}`
        : 'ONLINE';
    }

    if (order.paymentMethod === 'COD') {
      return 'COD';
    }

    return order.paymentMethod || '—';
  };

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
      {/* =========================
          HEADER
      ========================= */}

      <div className="admin-payments-header">
        <div>
          <button
            className="payments-back-button"
            onClick={() => navigate('/admin/dashboard')}
          >
            ← Dashboard
          </button>

          <h1>Payments Management</h1>

          <p>
            Monitor customer payments, payment status and transaction
            information.
          </p>
        </div>
      </div>

      {/* =========================
          ERROR
      ========================= */}

      {error && <div className="admin-payments-error">{error}</div>}

      {/* =========================
          PAYMENT STATS
      ========================= */}

      <div className="payments-stats-grid">
        <div className="payment-stat-card">
          <span>Total Payments</span>
          <strong>{totalPayments}</strong>
        </div>

        <div className="payment-stat-card">
          <span>Paid</span>
          <strong>{paidPayments.length}</strong>
          <small>{formatAmount(totalPaidAmount)}</small>
        </div>

        <div className="payment-stat-card">
          <span>Pending</span>
          <strong>{pendingPayments.length}</strong>
          <small>{formatAmount(totalPendingAmount)}</small>
        </div>

        <div className="payment-stat-card">
          <span>Failed</span>
          <strong>{failedPayments.length}</strong>
        </div>

        <div className="payment-stat-card">
          <span>Refunded</span>
          <strong>{refundedPayments.length}</strong>
          <small>{formatAmount(totalRefundedAmount)}</small>
        </div>

        <div className="payment-stat-card">
          <span>Online</span>
          <strong>{onlinePayments}</strong>
        </div>

        <div className="payment-stat-card">
          <span>COD</span>
          <strong>{codPayments}</strong>
        </div>
      </div>

      {/* =========================
          FILTERS
      ========================= */}

      <div className="payments-controls">
        <input
          type="text"
          placeholder="Search order, customer, shop, payment ID..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <select
          value={paymentStatusFilter}
          onChange={(event) => setPaymentStatusFilter(event.target.value)}
        >
          <option value="ALL">All Payment Status</option>
          <option value="Paid">Paid</option>
          <option value="Pending">Pending</option>
          <option value="Failed">Failed</option>
          <option value="Refunded">Refunded</option>
        </select>

        <select
          value={paymentMethodFilter}
          onChange={(event) => setPaymentMethodFilter(event.target.value)}
        >
          <option value="ALL">All Methods</option>
          <option value="ONLINE">Online</option>
          <option value="COD">COD</option>
        </select>
      </div>

      {/* =========================
          PAYMENT TABLE
      ========================= */}

      {loading ? (
        <div className="payments-loading">Loading payments...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="payments-empty">
          <h3>No payments found</h3>

          <p>No payment records match your current search or filters.</p>
        </div>
      ) : (
        <div className="payments-table-wrapper">
          <table className="payments-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Shop</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Payment ID</th>
                <th>Paid At</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.map((order) => {
                const owner = order.ownerId || {};
                const customer = order.customer || {};

                return (
                  <tr key={order._id}>
                    <td>
                      <div className="payment-order-cell">
                        <strong>{order.orderId}</strong>

                        <span>{formatDate(order.createdAt)}</span>
                      </div>
                    </td>

                    <td>
                      <div className="payment-customer-cell">
                        <strong>{customer.name || '—'}</strong>

                        <span>{customer.phone || '—'}</span>
                      </div>
                    </td>

                    <td>
                      <div className="payment-shop-cell">
                        <strong>{owner.shopName || '—'}</strong>

                        <span>{owner.shopId || '—'}</span>
                      </div>
                    </td>

                    <td>
                      <strong>{formatAmount(order.totalPrice)}</strong>
                    </td>

                    <td>
                      <span className="payment-method-badge">
                        {getPaymentMethodLabel(order)}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`payment-status-badge ${getPaymentStatusClass(
                          order.paymentStatus,
                        )}`}
                      >
                        {order.paymentStatus || 'Pending'}
                      </span>
                    </td>

                    <td>
                      <span className="payment-id-cell">
                        {order.paymentId || '—'}
                      </span>
                    </td>

                    <td>{formatDate(order.paidAt)}</td>

                    <td>
                      <button
                        className="view-payment-button"
                        onClick={() => handleViewPayment(order)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* =========================
          PAYMENT DETAILS MODAL
      ========================= */}

      {showModal && selectedOrder && (
        <div className="payment-modal-overlay" onClick={closeModal}>
          <div
            className="payment-modal"
            onClick={(event) => event.stopPropagation()}
          >
            {/* MODAL HEADER */}

            <div className="payment-modal-header">
              <div>
                <h2>Payment Details</h2>

                <p>Order #{selectedOrder.orderId}</p>
              </div>

              <button className="payment-modal-close" onClick={closeModal}>
                ×
              </button>
            </div>

            {/* PAYMENT STATUS */}

            <div className="payment-modal-status">
              <span>Payment Status</span>

              <strong
                className={`payment-status-badge ${getPaymentStatusClass(
                  selectedOrder.paymentStatus,
                )}`}
              >
                {selectedOrder.paymentStatus || 'Pending'}
              </strong>
            </div>

            {/* TRANSACTION */}

            <div className="payment-detail-section">
              <h3>Transaction</h3>

              <div className="payment-detail-grid">
                <div>
                  <span>Order ID</span>
                  <strong>{selectedOrder.orderId}</strong>
                </div>

                <div>
                  <span>Amount</span>
                  <strong>{formatAmount(selectedOrder.totalPrice)}</strong>
                </div>

                <div>
                  <span>Payment Method</span>
                  <strong>{getPaymentMethodLabel(selectedOrder)}</strong>
                </div>

                <div>
                  <span>Payment ID</span>
                  <strong>{selectedOrder.paymentId || '—'}</strong>
                </div>

                <div>
                  <span>Payment Order ID</span>
                  <strong>{selectedOrder.paymentOrderId || '—'}</strong>
                </div>

                <div>
                  <span>Paid At</span>
                  <strong>{formatDate(selectedOrder.paidAt)}</strong>
                </div>
              </div>
            </div>

            {/* CUSTOMER */}

            <div className="payment-detail-section">
              <h3>Customer</h3>

              <div className="payment-detail-grid">
                <div>
                  <span>Name</span>
                  <strong>{selectedOrder.customer?.name || '—'}</strong>
                </div>

                <div>
                  <span>Phone</span>
                  <strong>{selectedOrder.customer?.phone || '—'}</strong>
                </div>

                <div>
                  <span>Address</span>
                  <strong>{selectedOrder.customer?.address || '—'}</strong>
                </div>
              </div>
            </div>

            {/* SHOP */}

            <div className="payment-detail-section">
              <h3>Shop</h3>

              <div className="payment-detail-grid">
                <div>
                  <span>Shop Name</span>
                  <strong>{selectedOrder.ownerId?.shopName || '—'}</strong>
                </div>

                <div>
                  <span>Shop ID</span>
                  <strong>{selectedOrder.ownerId?.shopId || '—'}</strong>
                </div>

                <div>
                  <span>Owner</span>
                  <strong>{selectedOrder.ownerId?.ownerName || '—'}</strong>
                </div>

                <div>
                  <span>Owner Phone</span>
                  <strong>{selectedOrder.ownerId?.phone || '—'}</strong>
                </div>
              </div>
            </div>

            {/* ORDER */}

            <div className="payment-detail-section">
              <h3>Order Information</h3>

              <div className="payment-items-list">
                {selectedOrder.items?.map((item, index) => (
                  <div
                    className="payment-item"
                    key={`${item.productId}-${index}`}
                  >
                    <div>
                      <strong>{item.productName}</strong>

                      <span>
                        {item.quantity} × {formatAmount(item.price)}
                      </span>
                    </div>

                    <strong>
                      {formatAmount(
                        Number(item.price || 0) * Number(item.quantity || 0),
                      )}
                    </strong>
                  </div>
                ))}
              </div>
            </div>

            {/* TIMESTAMPS */}

            <div className="payment-detail-section">
              <h3>Order Timestamps</h3>

              <div className="payment-detail-grid">
                <div>
                  <span>Order Placed</span>
                  <strong>{formatDate(selectedOrder.createdAt)}</strong>
                </div>

                <div>
                  <span>Accepted</span>
                  <strong>{formatDate(selectedOrder.acceptedAt)}</strong>
                </div>

                <div>
                  <span>Preparing</span>
                  <strong>{formatDate(selectedOrder.preparingAt)}</strong>
                </div>

                <div>
                  <span>Ready</span>
                  <strong>{formatDate(selectedOrder.readyAt)}</strong>
                </div>

                <div>
                  <span>Out for Delivery</span>
                  <strong>{formatDate(selectedOrder.outForDeliveryAt)}</strong>
                </div>

                <div>
                  <span>Completed</span>
                  <strong>{formatDate(selectedOrder.completedAt)}</strong>
                </div>
              </div>
            </div>

            {/* FOOTER */}

            <div className="payment-modal-footer">
              <button
                className="payment-modal-close-button"
                onClick={closeModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPayments;
