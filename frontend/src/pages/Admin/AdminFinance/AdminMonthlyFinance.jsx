import './AdminMonthlyFinance.css';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import MonthlyFinanceHeader from './components/MonthlyFinance/MonthlyFinanceHeader';
import MonthlyFinanceSummary from './components/MonthlyFinance/MonthlyFinanceSummary';
import MonthlyOrderStatus from './components/MonthlyFinance/MonthlyOrderStatus';
import MonthlyShopRevenue from './components/MonthlyFinance/MonthlyShopRevenue';

import { fetchMonthlyFinance } from './utils/MonthlyFinance/monthlyFinanceApi';

import {
  getCurrentMonth,
  formatCurrency,
  formatStatus,
} from './utils/MonthlyFinance/monthlyFinanceHelpers';

function AdminMonthlyFinance() {
  const navigate = useNavigate();

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [stats, setStats] = useState({
    totalOrders: 0,
    completedOrders: 0,
    paidOrders: 0,
    pendingOrders: 0,
    rejectedOrders: 0,
    totalTransactionValue: 0,
    completedTransactionValue: 0,
    totalRmaFees: 0,
  });

  const [orderStatus, setOrderStatus] = useState({
    Pending: 0,
    Accepted: 0,
    Preparing: 0,
    Ready: 0,
    OutForDelivery: 0,
    Completed: 0,
    Rejected: 0,
  });

  const [shops, setShops] = useState([]);

  useEffect(() => {
    const loadMonthlyFinance = async () => {
      try {
        setLoading(true);
        setError('');

        const data = await fetchMonthlyFinance(selectedMonth);

        setStats(data.stats);
        setOrderStatus(data.orderStatus);
        setShops(data.shops);
      } catch (error) {
        console.error('Monthly finance fetch error:', error);

        if (error.status === 401) {
          navigate('/admin/login');
          return;
        }

        setError(error.message || 'Failed to load monthly finance');
      } finally {
        setLoading(false);
      }
    };

    loadMonthlyFinance();
  }, [selectedMonth, navigate]);

  return (
    <div className="admin_monthly_finance_page">
      <MonthlyFinanceHeader
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        onBack={() => navigate('/admin/dashboard')}
      />

      {loading && (
        <div className="admin_finance_message">Loading monthly finance...</div>
      )}

      {error && <div className="admin_finance_error">{error}</div>}

      {!loading && !error && (
        <>
          <MonthlyFinanceSummary
            stats={stats}
            formatCurrency={formatCurrency}
          />

          <MonthlyOrderStatus
            orderStatus={orderStatus}
            formatStatus={formatStatus}
          />

          <MonthlyShopRevenue
            shops={shops}
            onViewShop={(shopId) => navigate(`/admin/shops/${shopId}`)}
            formatCurrency={formatCurrency}
          />
        </>
      )}
    </div>
  );
}

export default AdminMonthlyFinance;
