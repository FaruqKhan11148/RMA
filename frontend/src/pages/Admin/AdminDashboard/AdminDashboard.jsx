import './AdminDashboard.css';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

        // Check admin session
        const sessionResponse = await fetch(
          'http://localhost:5000/api/admin/me',
          {
            method: 'GET',
            credentials: 'include',
          },
        );

        if (!sessionResponse.ok) {
          navigate('/admin/login', { replace: true });
          return;
        }

        const sessionData = await sessionResponse.json();

        setAdmin(sessionData.admin);

        // Fetch real dashboard data
        const dashboardResponse = await fetch(
          'http://localhost:5000/api/admin/dashboard',
          {
            method: 'GET',
            credentials: 'include',
          },
        );

        const dashboardData = await dashboardResponse.json();

        if (!dashboardResponse.ok) {
          throw new Error(dashboardData.message || 'Failed to load dashboard');
        }

        setStats(dashboardData.stats);
        setOrderStatus(dashboardData.orderStatus);
      } catch (error) {
        console.error('Admin dashboard fetch failed:', error);
      } finally {
        setLoading(false);
        setDashboardLoading(false);
      }
    };

    loadAdminDashboard();
  }, [navigate]);

  if (loading) {
    return <div className="admin-loading">Checking admin session...</div>;
  }

  if (!admin) {
    return null;
  }

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}

      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-brand-logo">RMA</div>

          <div>
            <h2>RMA Admin</h2>
            <span>Control Center</span>
          </div>
        </div>

        <nav className="admin-nav">
          <button className="admin-nav-item active">Dashboard</button>

          <button
            className="admin-nav-item"
            onClick={() => navigate('/admin/owners')}
          >
            Owners
          </button>

          <button
            className="admin-nav-item"
            onClick={() => navigate('/admin/customers')}
          >
            Customers
          </button>

          <button
            className="admin-nav-item"
            onClick={() => navigate('/admin/orders')}
          >
            Orders
          </button>

          <button
            className="admin-nav-item"
            onClick={() => navigate('/admin/delivery')}
          >
            Delivery
          </button>

          <button
            className="admin-nav-item"
            onClick={() => navigate('/admin/payments')}
          >
            Payments
          </button>

          <button
            className="admin-nav-item"
            onClick={() => navigate('/admin/finance')}
          >
            Finance
          </button>
        </nav>

        <div className="admin-sidebar-bottom">
          <div className="admin-user">
            <div className="admin-user-avatar">
              {admin.username.charAt(0).toUpperCase()}
            </div>

            <div>
              <strong>{admin.username}</strong>
              <span>Administrator</span>
            </div>
          </div>

          <button
            className="admin-logout-button"
            onClick={async () => {
              try {
                await fetch('http://localhost:5000/api/admin/logout', {
                  method: 'POST',
                  credentials: 'include',
                });
              } catch (error) {
                console.error('Logout error:', error);
              }

              navigate('/admin/login', { replace: true });
            }}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <h1>Dashboard</h1>
            <p>Welcome back, {admin.username}</p>
          </div>

          <div className="admin-status">
            <span className="admin-status-dot"></span>
            System Online
          </div>
        </header>

        {/* Statistics */}

        <section className="admin-stats-grid">
          <div className="admin-stat-card">
            <span>Total Shops</span>
            <strong>{dashboardLoading ? '...' : stats.totalOwners}</strong>
            <small>Registered owners</small>
          </div>

          <div className="admin-stat-card">
            <span>Total Customers</span>
            <strong>{dashboardLoading ? '...' : stats.totalCustomers}</strong>
            <small>Registered customers</small>
          </div>

          <div className="admin-stat-card">
            <span>Total Orders</span>
            <strong>{dashboardLoading ? '...' : stats.totalOrders}</strong>
            <small>All-time orders</small>
          </div>

          <div className="admin-stat-card">
            <span>RMA Fees</span>
            <strong>
              {dashboardLoading ? '...' : `₹${stats.totalRmaFees}`}
            </strong>
            <small>Platform revenue</small>
          </div>
        </section>

        {/* Dashboard Content */}

        <section className="admin-content-grid">
          <div className="admin-panel">
            <div className="admin-panel-header">
              <div>
                <h2>Order Overview</h2>
                <p>Current order distribution</p>
              </div>
            </div>

            <div className="order-status-list">
              <div className="order-status-row">
                <span>Pending</span>
                <strong>
                  {dashboardLoading ? '...' : orderStatus.Pending}
                </strong>
              </div>

              <div className="order-status-row">
                <span>Accepted</span>
                <strong>{orderStatus.Accepted}</strong>
              </div>

              <div className="order-status-row">
                <span>Preparing</span>
                <strong>{orderStatus.Preparing}</strong>
              </div>

              <div className="order-status-row">
                <span>Ready</span>
                <strong>{orderStatus.Ready}</strong>
              </div>

              <div className="order-status-row">
                <span>Out for Delivery</span>
                <strong>{orderStatus.OutForDelivery}</strong>
              </div>

              <div className="order-status-row">
                <span>Completed</span>
                <strong>{orderStatus.Completed}</strong>
              </div>
            </div>
          </div>

          <div className="admin-panel">
            <div className="admin-panel-header">
              <div>
                <h2>RMA Platform</h2>
                <p>System information</p>
              </div>
            </div>

            <div className="admin-system-info">
              <div>
                <span>Administrator</span>
                <strong>{admin.username}</strong>
              </div>

              <div>
                <span>Account Status</span>
                <strong>Active</strong>
              </div>

              <div>
                <span>Platform Fee</span>
                <strong>1%</strong>
              </div>

              <div>
                <span>Authentication</span>
                <strong>Protected</strong>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;
