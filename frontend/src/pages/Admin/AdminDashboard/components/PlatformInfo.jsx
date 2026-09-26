function PlatformInfo({ admin }) {
  return (
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
  );
}

export default PlatformInfo;
