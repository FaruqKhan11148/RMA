function OwnersHeader({ ownerCount, onBack }) {
  return (
    <div className="admin-page-header">
      <div>
        <button className="back-button" onClick={onBack}>
          ← Dashboard
        </button>

        <h1>Shop Owners</h1>

        <p>Manage and monitor all registered RMA shops.</p>
      </div>

      <div className="admin-owner-count">{ownerCount} registered</div>
    </div>
  );
}

export default OwnersHeader;
