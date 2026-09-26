function AdminTopbar({ admin }) {
  return (
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
  );
}

export default AdminTopbar;
