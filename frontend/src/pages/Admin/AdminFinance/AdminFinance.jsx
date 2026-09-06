import './AdminFinance.css';

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminFinance() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const fetchFinanceData = async () => {
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
          throw new Error(data.message || 'Failed to fetch finance data');
        }

        setOrders(data.orders || []);
      } catch (err) {
        console.error('Admin finance fetch error:', err);
        setError(err.message || 'Failed to load finance data');
      } finally {
        setLoading(false);
      }
    };

    fetchFinanceData();
  }, [navigate]);

  const financeSummary = useMemo(() => {
    let grossOrderValue = 0;
    let totalRmaRevenue = 0;
    let totalOwnerSettlement = 0;

    let paidRevenue = 0;
    let pendingPaymentValue = 0;
    let failedPaymentValue = 0;
    let refundedValue = 0;

    let paidOrders = 0;
    let pendingOrders = 0;
    let failedOrders = 0;
    let refundedOrders = 0;

    orders.forEach((order) => {
      const total = Number(order.totalPrice || 0);
      const rmaFee = Number(order.rmaFee || total * 0.01);
      const ownerAmount = Number(order.ownerAmount ?? total - rmaFee);

      grossOrderValue += total;
      totalRmaRevenue += rmaFee;
      totalOwnerSettlement += ownerAmount;

      if (order.paymentStatus === 'Paid') {
        paidRevenue += total;
        paidOrders += 1;
      }

      if (order.paymentStatus === 'Pending') {
        pendingPaymentValue += total;
        pendingOrders += 1;
      }

      if (order.paymentStatus === 'Failed') {
        failedPaymentValue += total;
        failedOrders += 1;
      }

      if (order.paymentStatus === 'Refunded') {
        refundedValue += total;
        refundedOrders += 1;
      }
    });

    return {
      grossOrderValue,
      totalRmaRevenue,
      totalOwnerSettlement,

      paidRevenue,
      pendingPaymentValue,
      failedPaymentValue,
      refundedValue,

      paidOrders,
      pendingOrders,
      failedOrders,
      refundedOrders,

      totalOrders: orders.length,
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return orders.filter((order) => {
      const owner = order.ownerId || {};

      const matchesSearch =
        !searchValue ||
        order.orderId?.toLowerCase().includes(searchValue) ||
        order.customer?.name?.toLowerCase().includes(searchValue) ||
        order.customer?.phone?.toLowerCase().includes(searchValue) ||
        owner.shopName?.toLowerCase().includes(searchValue) ||
        owner.shopId?.toLowerCase().includes(searchValue);

      const matchesPayment =
        paymentFilter === 'ALL' || order.paymentStatus === paymentFilter;

      return matchesSearch && matchesPayment;
    });
  }, [orders, search, paymentFilter]);

  const shopFinance = useMemo(() => {
    const shopMap = {};

    orders.forEach((order) => {
      const owner = order.ownerId || {};

      const shopId = owner.shopId || 'UNKNOWN';
      const shopName = owner.shopName || 'Unknown Shop';

      if (!shopMap[shopId]) {
        shopMap[shopId] = {
          shopId,
          shopName,
          orders: 0,
          grossValue: 0,
          rmaRevenue: 0,
          ownerSettlement: 0,
          paidValue: 0,
          pendingValue: 0,
        };
      }

      const total = Number(order.totalPrice || 0);
      const rmaFee = Number(order.rmaFee || total * 0.01);
      const ownerAmount = Number(order.ownerAmount ?? total - rmaFee);

      shopMap[shopId].orders += 1;
      shopMap[shopId].grossValue += total;
      shopMap[shopId].rmaRevenue += rmaFee;
      shopMap[shopId].ownerSettlement += ownerAmount;

      if (order.paymentStatus === 'Paid') {
        shopMap[shopId].paidValue += total;
      }

      if (order.paymentStatus === 'Pending') {
        shopMap[shopId].pendingValue += total;
      }
    });

    return Object.values(shopMap).sort((a, b) => b.grossValue - a.grossValue);
  }, [orders]);

  const formatMoney = (amount) => {
    return `₹${Number(amount || 0).toFixed(2)}`;
  };

  const formatDate = (date) => {
    if (!date) return '-';

    return new Date(date).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const getPaymentClass = (status) => {
    switch (status) {
      case 'Paid':
        return 'finance-status finance-status-paid';

      case 'Pending':
        return 'finance-status finance-status-pending';

      case 'Failed':
        return 'finance-status finance-status-failed';

      case 'Refunded':
        return 'finance-status finance-status-refunded';

      default:
        return 'finance-status';
    }
  };

  return (
    <div className="admin-finance-page">
      <div className="admin-finance-header">
        <div>
          <button
            className="finance-back-button"
            onClick={() => navigate('/admin/dashboard')}
          >
            ← Dashboard
          </button>

          <h1>Finance</h1>

          <p>
            Complete financial overview of RMA orders, platform revenue and shop
            settlements.
          </p>
        </div>

        <div className="finance-fee-info">
          <span>RMA Platform Fee</span>
          <strong>1%</strong>
        </div>
      </div>

      {error && <div className="finance-error">{error}</div>}

      {loading ? (
        <div className="finance-loading">Loading finance data...</div>
      ) : (
        <>
          {/* Main Finance Stats */}

          <div className="finance-stats-grid">
            <div className="finance-stat-card">
              <span>Gross Order Value</span>
              <strong>{formatMoney(financeSummary.grossOrderValue)}</strong>
              <small>{financeSummary.totalOrders} total orders</small>
            </div>

            <div className="finance-stat-card finance-rma-card">
              <span>RMA Revenue</span>
              <strong>{formatMoney(financeSummary.totalRmaRevenue)}</strong>
              <small>1% platform fee</small>
            </div>

            <div className="finance-stat-card">
              <span>Owner Settlement</span>
              <strong>
                {formatMoney(financeSummary.totalOwnerSettlement)}
              </strong>
              <small>After RMA platform fee</small>
            </div>

            <div className="finance-stat-card">
              <span>Paid Revenue</span>
              <strong>{formatMoney(financeSummary.paidRevenue)}</strong>
              <small>{financeSummary.paidOrders} paid orders</small>
            </div>

            <div className="finance-stat-card">
              <span>Pending Payments</span>
              <strong>{formatMoney(financeSummary.pendingPaymentValue)}</strong>
              <small>{financeSummary.pendingOrders} pending orders</small>
            </div>

            <div className="finance-stat-card">
              <span>Refunded</span>
              <strong>{formatMoney(financeSummary.refundedValue)}</strong>
              <small>{financeSummary.refundedOrders} refunded orders</small>
            </div>
          </div>

          {/* Payment Breakdown */}

          <div className="finance-section">
            <div className="finance-section-header">
              <div>
                <h2>Payment Breakdown</h2>
                <p>Current payment state across all orders.</p>
              </div>
            </div>

            <div className="finance-payment-grid">
              <div className="finance-payment-card">
                <span>Paid</span>
                <strong>{formatMoney(financeSummary.paidRevenue)}</strong>
                <small>{financeSummary.paidOrders} orders</small>
              </div>

              <div className="finance-payment-card">
                <span>Pending</span>
                <strong>
                  {formatMoney(financeSummary.pendingPaymentValue)}
                </strong>
                <small>{financeSummary.pendingOrders} orders</small>
              </div>

              <div className="finance-payment-card">
                <span>Failed</span>
                <strong>
                  {formatMoney(financeSummary.failedPaymentValue)}
                </strong>
                <small>{financeSummary.failedOrders} orders</small>
              </div>

              <div className="finance-payment-card">
                <span>Refunded</span>
                <strong>{formatMoney(financeSummary.refundedValue)}</strong>
                <small>{financeSummary.refundedOrders} orders</small>
              </div>
            </div>
          </div>

          {/* Shop Finance */}

          <div className="finance-section">
            <div className="finance-section-header">
              <div>
                <h2>Shop-wise Finance</h2>
                <p>
                  Revenue and settlement breakdown for each registered shop.
                </p>
              </div>
            </div>

            {shopFinance.length === 0 ? (
              <div className="finance-empty">
                No shop finance data available.
              </div>
            ) : (
              <div className="finance-table-wrapper">
                <table className="finance-table">
                  <thead>
                    <tr>
                      <th>Shop</th>
                      <th>Orders</th>
                      <th>Gross Value</th>
                      <th>RMA Fee</th>
                      <th>Owner Settlement</th>
                      <th>Paid</th>
                      <th>Pending</th>
                    </tr>
                  </thead>

                  <tbody>
                    {shopFinance.map((shop) => (
                      <tr key={shop.shopId}>
                        <td>
                          <div className="finance-shop-name">
                            <strong>{shop.shopName}</strong>
                            <span>{shop.shopId}</span>
                          </div>
                        </td>

                        <td>{shop.orders}</td>

                        <td>{formatMoney(shop.grossValue)}</td>

                        <td className="finance-rma-value">
                          {formatMoney(shop.rmaRevenue)}
                        </td>

                        <td className="finance-owner-value">
                          {formatMoney(shop.ownerSettlement)}
                        </td>

                        <td>{formatMoney(shop.paidValue)}</td>

                        <td>{formatMoney(shop.pendingValue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Order Finance */}

          <div className="finance-section">
            <div className="finance-section-header">
              <div>
                <h2>Order Finance</h2>
                <p>RMA fee and owner settlement calculated for every order.</p>
              </div>
            </div>

            <div className="finance-controls">
              <input
                type="text"
                placeholder="Search order, customer, phone or shop..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
              >
                <option value="ALL">All Payments</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
                <option value="Refunded">Refunded</option>
              </select>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="finance-empty">No orders found.</div>
            ) : (
              <div className="finance-table-wrapper">
                <table className="finance-table">
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Shop</th>
                      <th>Gross</th>
                      <th>RMA 1%</th>
                      <th>Owner Amount</th>
                      <th>Payment</th>
                      <th>Order Status</th>
                      <th>Placed At</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredOrders.map((order) => {
                      const owner = order.ownerId || {};

                      return (
                        <tr key={order._id || order.orderId}>
                          <td>
                            <strong>{order.orderId}</strong>
                          </td>

                          <td>
                            <div className="finance-shop-name">
                              <strong>{owner.shopName || '-'}</strong>

                              <span>{owner.shopId || '-'}</span>
                            </div>
                          </td>

                          <td>{formatMoney(order.totalPrice)}</td>

                          <td className="finance-rma-value">
                            {formatMoney(order.rmaFee)}
                          </td>

                          <td className="finance-owner-value">
                            {formatMoney(order.ownerAmount)}
                          </td>

                          <td>
                            <span
                              className={getPaymentClass(order.paymentStatus)}
                            >
                              {order.paymentStatus || 'Unknown'}
                            </span>
                          </td>

                          <td>
                            <span className="finance-order-status">
                              {order.status || '-'}
                            </span>
                          </td>

                          <td>{formatDate(order.createdAt)}</td>

                          <td>
                            <button
                              className="finance-view-button"
                              onClick={() => setSelectedOrder(order)}
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

            <div className="finance-results-count">
              Showing {filteredOrders.length} of {orders.length} orders
            </div>
          </div>
        </>
      )}

      {/* Order Finance Modal */}

      {selectedOrder && (
        <div
          className="finance-modal-overlay"
          onClick={() => setSelectedOrder(null)}
        >
          <div className="finance-modal" onClick={(e) => e.stopPropagation()}>
            <div className="finance-modal-header">
              <div>
                <span>Order Finance</span>
                <h2>{selectedOrder.orderId}</h2>
              </div>

              <button
                className="finance-modal-close"
                onClick={() => setSelectedOrder(null)}
              >
                ×
              </button>
            </div>

            <div className="finance-modal-content">
              <div className="finance-detail-grid">
                <div>
                  <span>Gross Order Value</span>
                  <strong>{formatMoney(selectedOrder.totalPrice)}</strong>
                </div>

                <div>
                  <span>RMA Platform Fee</span>
                  <strong className="finance-rma-value">
                    {formatMoney(selectedOrder.rmaFee)}
                  </strong>
                </div>

                <div>
                  <span>Owner Settlement</span>
                  <strong className="finance-owner-value">
                    {formatMoney(selectedOrder.ownerAmount)}
                  </strong>
                </div>

                <div>
                  <span>Payment Status</span>
                  <strong>{selectedOrder.paymentStatus || '-'}</strong>
                </div>
              </div>

              <div className="finance-modal-section">
                <h3>Customer</h3>

                <p>
                  <strong>{selectedOrder.customer?.name || '-'}</strong>
                </p>

                <p>{selectedOrder.customer?.phone || '-'}</p>
              </div>

              <div className="finance-modal-section">
                <h3>Shop</h3>

                <p>
                  <strong>{selectedOrder.ownerId?.shopName || '-'}</strong>
                </p>

                <p>Shop ID: {selectedOrder.ownerId?.shopId || '-'}</p>

                <p>Owner: {selectedOrder.ownerId?.ownerName || '-'}</p>
              </div>

              <div className="finance-modal-section">
                <h3>Payment</h3>

                <div className="finance-modal-info">
                  <span>Method</span>
                  <strong>{selectedOrder.paymentMethod || '-'}</strong>
                </div>

                <div className="finance-modal-info">
                  <span>Online Method</span>
                  <strong>{selectedOrder.onlinePaymentMethod || '-'}</strong>
                </div>

                <div className="finance-modal-info">
                  <span>Payment ID</span>
                  <strong>{selectedOrder.paymentId || '-'}</strong>
                </div>

                <div className="finance-modal-info">
                  <span>Payment Order ID</span>
                  <strong>{selectedOrder.paymentOrderId || '-'}</strong>
                </div>

                <div className="finance-modal-info">
                  <span>Paid At</span>
                  <strong>{formatDate(selectedOrder.paidAt)}</strong>
                </div>
              </div>

              <div className="finance-modal-section">
                <h3>Order Timeline</h3>

                <div className="finance-timeline">
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
                    <span>Out For Delivery</span>
                    <strong>
                      {formatDate(selectedOrder.outForDeliveryAt)}
                    </strong>
                  </div>

                  <div>
                    <span>Completed</span>
                    <strong>{formatDate(selectedOrder.completedAt)}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="finance-modal-footer">
              <button onClick={() => setSelectedOrder(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminFinance;
