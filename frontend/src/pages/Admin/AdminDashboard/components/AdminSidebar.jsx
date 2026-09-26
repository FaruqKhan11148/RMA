function AdminSidebar({ admin, onNavigate, onLogout }) {
  return (
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
          onClick={() => onNavigate('/admin/owners')}
        >
          Owners
        </button>

        <button
          className="admin-nav-item"
          onClick={() => onNavigate('/admin/shops')}
        >
          Shops
        </button>

        <button
          className="admin-nav-item"
          onClick={() => onNavigate('/admin/customers')}
        >
          Customers
        </button>

        <button
          className="admin-nav-item"
          onClick={() => onNavigate('/admin/orders')}
        >
          Orders
        </button>

        <button
          className="admin-nav-item"
          onClick={() => onNavigate('/admin/orders/daily')}
        >
          Daily Orders
        </button>

        <button
          className="admin-nav-item"
          onClick={() => onNavigate('/admin/finance/monthly')}
        >
          Monthly Finance
        </button>

        <button
          className="admin-nav-item"
          onClick={() => onNavigate('/admin/delivery')}
        >
          Delivery
        </button>

        <button
          className="admin-nav-item"
          onClick={() => onNavigate('/admin/payments')}
        >
          Payments
        </button>

        <button
          className="admin-nav-item"
          onClick={() => onNavigate('/admin/finance')}
        >
          Finance
        </button>

        <button
          className="admin-nav-item"
          onClick={() => onNavigate('/admin/delivery-partners')}
        >
          Delivery Partners
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

        <button className="admin-logout-button" onClick={onLogout}>
          Logout
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;
