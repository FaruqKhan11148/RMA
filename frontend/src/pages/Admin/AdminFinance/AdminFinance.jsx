import './AdminFinance.css';

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import FinanceHeader from './components/Finance/FinanceHeader';
import FinanceStats from './components/Finance/FinanceStats';
import PaymentBreakdown from './components/Finance/PaymentBreakdown';
import ShopFinance from './components/Finance/ShopFinance';
import OrderFinance from './components/Finance/OrderFinance';
import FinanceOrderModal from './components/Finance/FinanceOrderModal';
import FinanceWithdrawals from './components/Withdrawals/FinanceWithdrawals';
import RmaAccount from './components/RmaAccount/RmaAccount';
import OwnerAccounts from './components/OwnerAccounts/OwnerAccounts';
import DeliveryPartnerAccounts from './components/DeliveryPartnerAccounts/DeliveryPartnerAccounts';

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

  const [activeSection, setActiveSection] = useState('overview');

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

      <div className="finance-center-nav">
        <button
          type="button"
          className={
            activeSection === 'overview'
              ? 'finance-center-nav-item active'
              : 'finance-center-nav-item'
          }
          onClick={() => setActiveSection('overview')}
        >
          Overview
        </button>

        <button
          type="button"
          className={
            activeSection === 'rma-account'
              ? 'finance-center-nav-item active'
              : 'finance-center-nav-item'
          }
          onClick={() => setActiveSection('rma-account')}
        >
          RMA Account
        </button>

        <button
          type="button"
          className={
            activeSection === 'owner-accounts'
              ? 'finance-center-nav-item active'
              : 'finance-center-nav-item'
          }
          onClick={() => setActiveSection('owner-accounts')}
        >
          Owner Accounts
        </button>

        <button
          type="button"
          className={
            activeSection === 'delivery-partner-accounts'
              ? 'finance-center-nav-item active'
              : 'finance-center-nav-item'
          }
          onClick={() => setActiveSection('delivery-partner-accounts')}
        >
          Delivery Partners
        </button>

        <button
          type="button"
          className={
            activeSection === 'withdrawals'
              ? 'finance-center-nav-item active'
              : 'finance-center-nav-item'
          }
          onClick={() => setActiveSection('withdrawals')}
        >
          Withdrawals
        </button>
      </div>

      {activeSection === 'rma-account' ? (
        <RmaAccount />
      ) : activeSection === 'owner-accounts' ? (
        <OwnerAccounts />
      ) : activeSection === 'delivery-partner-accounts' ? (
        <DeliveryPartnerAccounts />
      ) : activeSection === 'withdrawals' ? (
        <FinanceWithdrawals />
      ) : (
        <>
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

              <ShopFinance
                shopFinance={shopFinance}
                formatMoney={formatMoney}
              />

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
        </>
      )}

      {activeSection === 'overview' && (
        <FinanceOrderModal
          selectedOrder={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          formatMoney={formatMoney}
          formatDate={formatDate}
        />
      )}
    </div>
  );
}

export default AdminFinance;
