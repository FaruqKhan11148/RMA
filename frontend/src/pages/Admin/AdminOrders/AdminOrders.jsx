import './AdminOrders.css';

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');

  const [selectedOrder, setSelectedOrder] = useState(null);

  // --------------------------------------------------
  // FETCH ORDERS
  // --------------------------------------------------

  useEffect(() => {
    const fetchOrders = async () => {
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
          throw new Error(data.message || 'Failed to fetch orders');
        }

        setOrders(data.orders || []);
      } catch (error) {
        console.error('Admin orders fetch error:', error);

        setError(error.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  // --------------------------------------------------
  // FORMAT DATE
  // --------------------------------------------------

  const formatDate = (date) => {
    if (!date) return '-';

    return new Date(date).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  // --------------------------------------------------
  // STATUS CLASS
  // --------------------------------------------------

  const getStatusClass = (status) => {
    switch (status) {
      case 'Pending':
        return 'pending';

      case 'Accepted':
        return 'accepted';

      case 'Preparing':
        return 'preparing';

      case 'Ready':
        return 'ready';

      case 'OutForDelivery':
        return 'out-for-delivery';

      case 'Completed':
        return 'completed';

      case 'Rejected':
        return 'rejected';

      default:
        return '';
    }
  };

  // --------------------------------------------------
  // PAYMENT CLASS
  // --------------------------------------------------

  const getPaymentClass = (status) => {
    switch (status) {
      case 'Paid':
        return 'paid';

      case 'Failed':
        return 'failed';

      case 'Refunded':
        return 'refunded';

      case 'Pending':
      default:
        return 'payment-pending';
    }
  };

  // --------------------------------------------------
  // FILTER ORDERS
  // --------------------------------------------------

  const filteredOrders = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return orders.filter((order) => {
      const owner = order.ownerId || {};
      const customer = order.customer || {};

      const matchesSearch =
        !searchValue ||
        order.orderId?.toLowerCase().includes(searchValue) ||
        customer.name?.toLowerCase().includes(searchValue) ||
        customer.phone?.toLowerCase().includes(searchValue) ||
        owner.shopName?.toLowerCase().includes(searchValue) ||
        owner.ownerName?.toLowerCase().includes(searchValue) ||
        owner.shopId?.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === 'All' || order.status === statusFilter;

      const matchesPayment =
        paymentFilter === 'All' || order.paymentStatus === paymentFilter;

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [orders, search, statusFilter, paymentFilter]);

  // --------------------------------------------------
  // STATISTICS
  // --------------------------------------------------

  const stats = useMemo(() => {
    const totalOrders = orders.length;

    const pending = orders.filter((order) => order.status === 'Pending').length;

    const accepted = orders.filter(
      (order) => order.status === 'Accepted',
    ).length;

    const preparing = orders.filter(
      (order) => order.status === 'Preparing',
    ).length;

    const ready = orders.filter((order) => order.status === 'Ready').length;

    const outForDelivery = orders.filter(
      (order) => order.status === 'OutForDelivery',
    ).length;

    const completed = orders.filter(
      (order) => order.status === 'Completed',
    ).length;

    const rejected = orders.filter(
      (order) => order.status === 'Rejected',
    ).length;

    const totalRevenue = orders.reduce(
      (sum, order) => sum + Number(order.totalPrice || 0),
      0,
    );

    const totalRmaFee = orders.reduce(
      (sum, order) => sum + Number(order.rmaFee || 0),
      0,
    );

    const totalOwnerAmount = orders.reduce(
      (sum, order) => sum + Number(order.ownerAmount || 0),
      0,
    );

    return {
      totalOrders,
      pending,
      accepted,
      preparing,
      ready,
      outForDelivery,
      completed,
      rejected,
      totalRevenue,
      totalRmaFee,
      totalOwnerAmount,
    };
  }, [orders]);

  // --------------------------------------------------
  // TIMELINE STEP
  // --------------------------------------------------

  // const getTimelineStep = (order) => {
  //   if (order.status === 'Rejected') {
  //     return 'Rejected';
  //   }

  //   if (order.completedAt) {
  //     return 'Completed';
  //   }

  //   if (order.outForDeliveryAt) {
  //     return 'Out for Delivery';
  //   }

  //   if (order.readyAt) {
  //     return 'Ready';
  //   }

  //   if (order.preparingAt) {
  //     return 'Preparing';
  //   }

  //   if (order.acceptedAt) {
  //     return 'Accepted';
  //   }

  //   return 'Pending';
  // };

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="admin-orders-page">
        <div className="admin-orders-loading">Loading orders...</div>
      </div>
    );
  }

  // --------------------------------------------------
  // ERROR
  // --------------------------------------------------

  if (error) {
    return (
      <div className="admin-orders-page">
        <div className="admin-orders-error">
          <h2>Unable to load orders</h2>

          <p>{error}</p>

          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // PAGE
  // --------------------------------------------------

  return (
    <div className="admin-orders-page">
      {/* HEADER */}

      <div className="admin-orders-header">
        <div>
          <button
            className="admin-back-button"
            onClick={() => navigate('/admin/dashboard')}
          >
            ← Dashboard
          </button>
          <h1>Orders</h1>

          <p>Monitor every RMA order, payment, delivery and timeline event.</p>
        </div>
      </div>

      {/* STATS */}

      <div className="admin-orders-stats">
        <div className="admin-order-stat-card">
          <span>Total Orders</span>
          <strong>{stats.totalOrders}</strong>
        </div>

        <div className="admin-order-stat-card pending-card">
          <span>Pending</span>
          <strong>{stats.pending}</strong>
        </div>

        <div className="admin-order-stat-card preparing-card">
          <span>Preparing</span>
          <strong>{stats.preparing}</strong>
        </div>

        <div className="admin-order-stat-card ready-card">
          <span>Ready</span>
          <strong>{stats.ready}</strong>
        </div>

        <div className="admin-order-stat-card delivery-card">
          <span>Out for Delivery</span>
          <strong>{stats.outForDelivery}</strong>
        </div>

        <div className="admin-order-stat-card completed-card">
          <span>Completed</span>
          <strong>{stats.completed}</strong>
        </div>

        <div className="admin-order-stat-card rejected-card">
          <span>Rejected</span>
          <strong>{stats.rejected}</strong>
        </div>
      </div>

      {/* FINANCE SUMMARY */}

      <div className="admin-orders-finance">
        <div>
          <span>Total Order Value</span>

          <strong>₹{stats.totalRevenue.toFixed(2)}</strong>
        </div>

        <div>
          <span>RMA Platform Fee — 1%</span>

          <strong>₹{stats.totalRmaFee.toFixed(2)}</strong>
        </div>

        <div>
          <span>Owner Amount</span>

          <strong>₹{stats.totalOwnerAmount.toFixed(2)}</strong>
        </div>
      </div>

      {/* FILTERS */}

      <div className="admin-orders-controls">
        <div className="admin-orders-search">
          <input
            type="text"
            placeholder="Search Order ID, customer, phone, shop..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="admin-orders-filter">
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="All">All Statuses</option>

            <option value="Pending">Pending</option>

            <option value="Accepted">Accepted</option>

            <option value="Preparing">Preparing</option>

            <option value="Ready">Ready</option>

            <option value="OutForDelivery">Out for Delivery</option>

            <option value="Completed">Completed</option>

            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div className="admin-orders-filter">
          <select
            value={paymentFilter}
            onChange={(event) => setPaymentFilter(event.target.value)}
          >
            <option value="All">All Payments</option>

            <option value="Pending">Pending</option>

            <option value="Paid">Paid</option>

            <option value="Failed">Failed</option>

            <option value="Refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* RESULT COUNT */}

      <div className="admin-orders-result-count">
        Showing <strong>{filteredOrders.length}</strong> of{' '}
        <strong>{orders.length}</strong> orders
      </div>

      {/* ORDERS TABLE */}

      <div className="admin-orders-table-wrapper">
        <table className="admin-orders-table">
          <thead>
            <tr>
              <th>Order</th>

              <th>Customer</th>

              <th>Shop</th>

              <th>Amount</th>

              <th>RMA Fee</th>

              <th>Owner Amount</th>

              <th>Payment</th>

              <th>Status</th>

              <th>Placed At</th>

              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="10" className="admin-orders-empty">
                  No orders found.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => {
                const owner = order.ownerId || {};

                const customer = order.customer || {};

                return (
                  <tr key={order.orderId}>
                    {/* ORDER */}

                    <td>
                      <div className="order-id">{order.orderId}</div>

                      <small>
                        {order.orderType === 'delivery' ? 'Delivery' : 'Pickup'}
                      </small>
                    </td>

                    {/* CUSTOMER */}

                    <td>
                      <div className="customer-name">
                        {customer.name || '-'}
                      </div>

                      <small>{customer.phone || '-'}</small>
                    </td>

                    {/* SHOP */}

                    <td>
                      <div className="shop-name">{owner.shopName || '-'}</div>

                      <small>{owner.shopId || '-'}</small>
                    </td>

                    {/* AMOUNT */}

                    <td>
                      <strong>
                        ₹{Number(order.totalPrice || 0).toFixed(2)}
                      </strong>
                    </td>

                    {/* RMA FEE */}

                    <td>
                      <span className="fee-value">
                        ₹{Number(order.rmaFee || 0).toFixed(2)}
                      </span>
                    </td>

                    {/* OWNER */}

                    <td>
                      <span className="owner-value">
                        ₹{Number(order.ownerAmount || 0).toFixed(2)}
                      </span>
                    </td>

                    {/* PAYMENT */}

                    <td>
                      <span
                        className={`payment-badge ${getPaymentClass(
                          order.paymentStatus,
                        )}`}
                      >
                        {order.paymentStatus}
                      </span>

                      <small className="payment-method">
                        {order.paymentMethod}
                      </small>
                    </td>

                    {/* STATUS */}

                    <td>
                      <span
                        className={`order-status-badge ${getStatusClass(
                          order.status,
                        )}`}
                      >
                        {order.status === 'OutForDelivery'
                          ? 'Out for Delivery'
                          : order.status}
                      </span>
                    </td>

                    {/* PLACED */}

                    <td>
                      <small>{formatDate(order.createdAt)}</small>
                    </td>

                    {/* ACTION */}

                    <td>
                      <button
                        className="view-order-button"
                        onClick={() => setSelectedOrder(order)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ORDER DETAILS MODAL */}

      {selectedOrder && (
        <div
          className="admin-order-modal-overlay"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="admin-order-modal"
            onClick={(event) => event.stopPropagation()}
          >
            {/* MODAL HEADER */}

            <div className="admin-order-modal-header">
              <div>
                <h2>Order {selectedOrder.orderId}</h2>

                <p>Placed {formatDate(selectedOrder.createdAt)}</p>
              </div>

              <button
                className="modal-close-button"
                onClick={() => setSelectedOrder(null)}
              >
                ×
              </button>
            </div>

            {/* CURRENT STATUS */}

            <div className="order-modal-status">
              <span>Current Status</span>

              <strong
                className={`order-status-badge ${getStatusClass(
                  selectedOrder.status,
                )}`}
              >
                {selectedOrder.status === 'OutForDelivery'
                  ? 'Out for Delivery'
                  : selectedOrder.status}
              </strong>
            </div>

            {/* ORDER TIMELINE */}

            <div className="order-timeline-section">
              <h3>Order Timeline</h3>

              <div className="order-timeline">
                <div
                  className={`timeline-item ${
                    selectedOrder.createdAt ? 'timeline-completed' : ''
                  }`}
                >
                  <div className="timeline-dot" />

                  <div>
                    <strong>Order Placed</strong>

                    <span>{formatDate(selectedOrder.createdAt)}</span>
                  </div>
                </div>

                <div
                  className={`timeline-item ${
                    selectedOrder.acceptedAt ? 'timeline-completed' : ''
                  }`}
                >
                  <div className="timeline-dot" />

                  <div>
                    <strong>Accepted</strong>

                    <span>{formatDate(selectedOrder.acceptedAt)}</span>
                  </div>
                </div>

                <div
                  className={`timeline-item ${
                    selectedOrder.preparingAt ? 'timeline-completed' : ''
                  }`}
                >
                  <div className="timeline-dot" />

                  <div>
                    <strong>Preparing</strong>

                    <span>{formatDate(selectedOrder.preparingAt)}</span>
                  </div>
                </div>

                <div
                  className={`timeline-item ${
                    selectedOrder.readyAt ? 'timeline-completed' : ''
                  }`}
                >
                  <div className="timeline-dot" />

                  <div>
                    <strong>Ready</strong>

                    <span>{formatDate(selectedOrder.readyAt)}</span>
                  </div>
                </div>

                <div
                  className={`timeline-item ${
                    selectedOrder.outForDeliveryAt ? 'timeline-completed' : ''
                  }`}
                >
                  <div className="timeline-dot" />

                  <div>
                    <strong>Out for Delivery</strong>

                    <span>{formatDate(selectedOrder.outForDeliveryAt)}</span>
                  </div>
                </div>

                <div
                  className={`timeline-item ${
                    selectedOrder.otpVerified ? 'timeline-completed' : ''
                  }`}
                >
                  <div className="timeline-dot" />

                  <div>
                    <strong>Customer OTP Verified</strong>

                    <span>
                      {selectedOrder.otpVerified ? 'Verified' : 'Not verified'}
                    </span>
                  </div>
                </div>

                <div
                  className={`timeline-item ${
                    selectedOrder.completedAt ? 'timeline-completed' : ''
                  }`}
                >
                  <div className="timeline-dot" />

                  <div>
                    <strong>Completed</strong>

                    <span>{formatDate(selectedOrder.completedAt)}</span>
                  </div>
                </div>

                {selectedOrder.status === 'Rejected' && (
                  <div className="timeline-item timeline-rejected">
                    <div className="timeline-dot" />

                    <div>
                      <strong>Rejected</strong>

                      <span>{formatDate(selectedOrder.rejectedAt)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* CUSTOMER */}

            <div className="order-detail-section">
              <h3>Customer</h3>

              <div className="order-detail-grid">
                <div>
                  <label>Name</label>
                  <p>{selectedOrder.customer?.name || '-'}</p>
                </div>

                <div>
                  <label>Phone</label>
                  <p>{selectedOrder.customer?.phone || '-'}</p>
                </div>

                <div>
                  <label>Address</label>
                  <p>{selectedOrder.customer?.address || '-'}</p>
                </div>
              </div>
            </div>

            {/* SHOP / OWNER */}

            <div className="order-detail-section">
              <h3>Shop / Owner</h3>

              <div className="order-detail-grid">
                <div>
                  <label>Shop ID</label>
                  <p>{selectedOrder.ownerId?.shopId || '-'}</p>
                </div>

                <div>
                  <label>Shop Name</label>
                  <p>{selectedOrder.ownerId?.shopName || '-'}</p>
                </div>

                <div>
                  <label>Owner Name</label>
                  <p>{selectedOrder.ownerId?.ownerName || '-'}</p>
                </div>

                <div>
                  <label>Owner Phone</label>
                  <p>{selectedOrder.ownerId?.phone || '-'}</p>
                </div>
              </div>
            </div>

            {/* ITEMS */}

            <div className="order-detail-section">
              <h3>Items ({selectedOrder.totalItems || 0})</h3>

              <div className="order-items">
                {selectedOrder.items?.map((item, index) => (
                  <div
                    className="order-item"
                    key={`${item.productId}-${index}`}
                  >
                    <div>
                      <strong>{item.productName}</strong>

                      <span>
                        ₹{Number(item.price || 0).toFixed(2)}
                        {' × '}
                        {item.quantity}
                      </span>
                    </div>

                    <strong>
                      ₹
                      {(
                        Number(item.price || 0) * Number(item.quantity || 0)
                      ).toFixed(2)}
                    </strong>
                  </div>
                ))}
              </div>
            </div>

            {/* DELIVERY */}

            <div className="order-detail-section">
              <h3>Delivery</h3>

              <div className="order-detail-grid">
                <div>
                  <label>Order Type</label>
                  <p>{selectedOrder.orderType}</p>
                </div>

                <div>
                  <label>Address</label>
                  <p>
                    {selectedOrder.deliveryLocation?.address ||
                      selectedOrder.customer?.address ||
                      '-'}
                  </p>
                </div>

                <div>
                  <label>Latitude</label>
                  <p>{selectedOrder.deliveryLocation?.latitude ?? '-'}</p>
                </div>

                <div>
                  <label>Longitude</label>
                  <p>{selectedOrder.deliveryLocation?.longitude ?? '-'}</p>
                </div>
              </div>
            </div>

            {/* PAYMENT */}

            <div className="order-detail-section">
              <h3>Payment</h3>

              <div className="order-detail-grid">
                <div>
                  <label>Payment Status</label>

                  <p>
                    <span
                      className={`payment-badge ${getPaymentClass(
                        selectedOrder.paymentStatus,
                      )}`}
                    >
                      {selectedOrder.paymentStatus}
                    </span>
                  </p>
                </div>

                <div>
                  <label>Payment Method</label>

                  <p>{selectedOrder.paymentMethod}</p>
                </div>

                <div>
                  <label>Online Method</label>

                  <p>{selectedOrder.onlinePaymentMethod || '-'}</p>
                </div>

                <div>
                  <label>Payment ID</label>

                  <p>{selectedOrder.paymentId || '-'}</p>
                </div>

                <div>
                  <label>Payment Order ID</label>

                  <p>{selectedOrder.paymentOrderId || '-'}</p>
                </div>

                <div>
                  <label>Paid At</label>

                  <p>{formatDate(selectedOrder.paidAt)}</p>
                </div>
              </div>
            </div>

            {/* FINANCE */}

            <div className="order-detail-section">
              <h3>RMA Finance</h3>

              <div className="order-finance-grid">
                <div>
                  <span>Order Amount</span>

                  <strong>
                    ₹{Number(selectedOrder.totalPrice || 0).toFixed(2)}
                  </strong>
                </div>

                <div>
                  <span>RMA Platform Fee (1%)</span>

                  <strong>
                    ₹{Number(selectedOrder.rmaFee || 0).toFixed(2)}
                  </strong>
                </div>

                <div>
                  <span>Owner Amount</span>

                  <strong>
                    ₹{Number(selectedOrder.ownerAmount || 0).toFixed(2)}
                  </strong>
                </div>
              </div>
            </div>

            {/* OTP */}

            <div className="order-detail-section">
              <h3>Delivery OTP</h3>

              <div className="otp-status-box">
                <span>OTP Status</span>

                <strong
                  className={
                    selectedOrder.otpVerified
                      ? 'otp-verified'
                      : 'otp-not-verified'
                  }
                >
                  {selectedOrder.otpVerified ? 'Verified' : 'Not Verified'}
                </strong>

                <small>
                  OTP generated:{' '}
                  {formatDate(selectedOrder.deliveryOtpGeneratedAt)}
                </small>

                <small>The actual OTP is hidden from Admin for security.</small>
              </div>
            </div>

            {/* DATABASE TIMESTAMPS */}

            <div className="order-detail-section">
              <h3>System Timestamps</h3>

              <div className="order-detail-grid">
                <div>
                  <label>Created At</label>
                  <p>{formatDate(selectedOrder.createdAt)}</p>
                </div>

                <div>
                  <label>Last Updated</label>
                  <p>{formatDate(selectedOrder.updatedAt)}</p>
                </div>
              </div>
            </div>

            {/* CLOSE */}

            <div className="admin-order-modal-footer">
              <button onClick={() => setSelectedOrder(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminOrders;
