import './AdminOrders.css';

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import OrdersHeader from './components/Orders/OrdersHeader';
import OrdersStats from './components/Orders/OrdersStats';
import OrdersFinance from './components/Orders/OrdersFinance';
import OrdersFilters from './components/Orders/OrdersFilters';
import OrdersTable from './components/Orders/OrdersTable';
import OrderDetailsModal from './components/Orders/OrderDetailsModal';

import { fetchAdminOrders } from './utils/Orders/ordersApi';

import {
  formatDate,
  getStatusClass,
  getPaymentClass,
} from './utils/Orders/ordersHelpers';

function AdminOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');

  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        setError('');

        const orderList = await fetchAdminOrders();

        setOrders(orderList);
      } catch (error) {
        console.error('Admin orders fetch error:', error);

        if (error.status === 401) {
          navigate('/admin/login');
          return;
        }

        setError(error.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [navigate]);

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

  const stats = useMemo(() => {
    const result = {
      totalOrders: orders.length,

      pending: 0,
      accepted: 0,
      preparing: 0,
      ready: 0,
      outForDelivery: 0,
      completed: 0,
      rejected: 0,

      totalRevenue: 0,
      totalRmaFee: 0,
      totalOwnerAmount: 0,
    };

    orders.forEach((order) => {
      switch (order.status) {
        case 'Pending':
          result.pending += 1;
          break;

        case 'Accepted':
          result.accepted += 1;
          break;

        case 'Preparing':
          result.preparing += 1;
          break;

        case 'Ready':
          result.ready += 1;
          break;

        case 'OutForDelivery':
          result.outForDelivery += 1;
          break;

        case 'Completed':
          result.completed += 1;
          break;

        case 'Rejected':
          result.rejected += 1;
          break;

        default:
          break;
      }

      result.totalRevenue += Number(order.totalPrice || 0);

      result.totalRmaFee += Number(order.rmaFee || 0);

      result.totalOwnerAmount += Number(order.ownerAmount || 0);
    });

    return result;
  }, [orders]);

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
  };

  const handleCloseOrder = () => {
    setSelectedOrder(null);
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="admin-orders-page">
      <OrdersHeader onBack={() => navigate('/admin/dashboard')} />

      {error && (
        <div className="admin-orders-error">
          <h2>Unable to Load Orders</h2>

          <p>{error}</p>

          <button type="button" onClick={handleReload}>
            Reload
          </button>
        </div>
      )}

      {loading ? (
        <div className="admin-orders-loading">Loading orders...</div>
      ) : (
        <>
          <OrdersStats stats={stats} />

          <OrdersFinance stats={stats} />

          <OrdersFilters
            search={search}
            statusFilter={statusFilter}
            paymentFilter={paymentFilter}
            filteredCount={filteredOrders.length}
            totalCount={orders.length}
            onSearchChange={setSearch}
            onStatusChange={setStatusFilter}
            onPaymentChange={setPaymentFilter}
          />

          <OrdersTable
            orders={filteredOrders}
            formatDate={formatDate}
            getStatusClass={getStatusClass}
            getPaymentClass={getPaymentClass}
            onViewOrder={handleViewOrder}
          />
        </>
      )}

      <OrderDetailsModal
        selectedOrder={selectedOrder}
        onClose={handleCloseOrder}
        formatDate={formatDate}
        getStatusClass={getStatusClass}
      />
    </div>
  );
}

export default AdminOrders;
