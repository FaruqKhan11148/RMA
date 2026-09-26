import './AdminFinance.css';

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import FinanceHeader from './components/Finance/FinanceHeader';
import FinanceStats from './components/Finance/FinanceStats';
import PaymentBreakdown from './components/Finance/PaymentBreakdown';
import ShopFinance from './components/Finance/ShopFinance';
import OrderFinance from './components/Finance/OrderFinance';
import FinanceOrderModal from './components/Finance/FinanceOrderModal';

import { fetchFinanceData } from './utils/Finance/financeApi';

import {
  calculateFinanceSummary,
  filterFinanceOrders,
  calculateShopFinance,
  formatMoney,
  formatDate,
  getPaymentClass,
} from './utils/Finance/financeHelpers';

function AdminFinance() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const loadFinanceData = async () => {
      try {
        setLoading(true);
        setError('');

        const orderList = await fetchFinanceData();

        setOrders(orderList);
      } catch (error) {
        console.error('Admin finance fetch error:', error);

        if (error.status === 401) {
          navigate('/admin/login');
          return;
        }

        setError(error.message || 'Failed to load finance data');
      } finally {
        setLoading(false);
      }
    };

    loadFinanceData();
  }, [navigate]);

  const financeSummary = useMemo(
    () => calculateFinanceSummary(orders),
    [orders],
  );

  const filteredOrders = useMemo(
    () => filterFinanceOrders(orders, search, paymentFilter),
    [orders, search, paymentFilter],
  );

  const shopFinance = useMemo(() => calculateShopFinance(orders), [orders]);

  return (
    <div className="admin-finance-page">
      <FinanceHeader onBack={() => navigate('/admin/dashboard')} />

      {error && <div className="finance-error">{error}</div>}

      {loading ? (
        <div className="finance-loading">Loading finance data...</div>
      ) : (
        <>
          <FinanceStats
            financeSummary={financeSummary}
            formatMoney={formatMoney}
          />

          <PaymentBreakdown
            financeSummary={financeSummary}
            formatMoney={formatMoney}
          />

          <ShopFinance shopFinance={shopFinance} formatMoney={formatMoney} />

          <OrderFinance
            filteredOrders={filteredOrders}
            orders={orders}
            search={search}
            paymentFilter={paymentFilter}
            onSearchChange={setSearch}
            onPaymentFilterChange={setPaymentFilter}
            onViewOrder={setSelectedOrder}
            formatMoney={formatMoney}
            formatDate={formatDate}
            getPaymentClass={getPaymentClass}
          />
        </>
      )}

      <FinanceOrderModal
        selectedOrder={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        formatMoney={formatMoney}
        formatDate={formatDate}
      />
    </div>
  );
}

export default AdminFinance;
