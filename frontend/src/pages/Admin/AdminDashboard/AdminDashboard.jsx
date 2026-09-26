import './AdminDashboard.css';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AdminSidebar from './components/AdminSidebar';
import AdminTopbar from './components/AdminTopbar';
import AdminStats from './components/AdminStats';
import OrderOverview from './components/OrderOverview';
import PlatformInfo from './components/PlatformInfo';

import {
  fetchAdminSession,
  fetchDashboardData,
  logoutAdmin,
} from './utils/dashboardApi';

function AdminDashboard() {
  const navigate = useNavigate();

  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalOwners: 0,
    totalCustomers: 0,
    totalOrders: 0,
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

  const [dashboardLoading, setDashboardLoading] = useState(true);

  useEffect(() => {
    const loadAdminDashboard = async () => {
      try {
        setLoading(true);
        setDashboardLoading(true);

        const adminData = await fetchAdminSession();

        setAdmin(adminData);

        const dashboardData = await fetchDashboardData();

        setStats(dashboardData.stats);
        setOrderStatus(dashboardData.orderStatus);
      } catch (error) {
        console.error('Admin dashboard fetch failed:', error);

        if (error.status === 401) {
          navigate('/admin/login', { replace: true });
          return;
        }
      } finally {
        setLoading(false);
        setDashboardLoading(false);
      }
    };

    loadAdminDashboard();
  }, [navigate]);

  if (loading) {
    return <div className="admin-loading">wait it's Loading...</div>;
  }

  if (!admin) {
    return null;
  }

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}

      <AdminSidebar
        admin={admin}
        onNavigate={navigate}
        onLogout={async () => {
          try {
            await logoutAdmin();
          } catch (error) {
            console.error('Logout error:', error);
          }

          navigate('/admin/login', { replace: true });
        }}
      />

      {/* Main Content */}

      <main className="admin-main">
        <AdminTopbar admin={admin} />

        {/* Statistics */}

        <AdminStats stats={stats} dashboardLoading={dashboardLoading} />

        {/* Dashboard Content */}

        <section className="admin-content-grid">
          <OrderOverview
            orderStatus={orderStatus}
            dashboardLoading={dashboardLoading}
          />

          <PlatformInfo admin={admin} />
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;
