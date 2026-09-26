function OwnersTable({ owners, onViewOwner }) {
  if (!owners.length) {
    return <div className="admin-empty-state">No shop owners found.</div>;
  }

  return (
    <div className="admin-owner-table-container">
      <table className="admin-owner-table">
        <thead>
          <tr>
            <th>Shop ID</th>
            <th>Owner</th>
            <th>Shop</th>
            <th>Phone</th>
            <th>Products</th>
            <th>Services</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {owners.map((owner) => (
            <tr key={owner._id}>
              <td>
                <strong>{owner.shopId}</strong>
              </td>

              <td>{owner.ownerName}</td>

              <td>{owner.shopName}</td>

              <td>{owner.phone}</td>

              <td>{owner.products?.length || 0}</td>

              <td>
                <div className="admin-service-badges">
                  {owner.delivery && (
                    <span className="service-badge delivery">Delivery</span>
                  )}

                  {owner.pickup && (
                    <span className="service-badge pickup">Pickup</span>
                  )}
                </div>
              </td>

              <td>
                <span
                  className={`owner-status ${owner.isOpen ? 'open' : 'closed'}`}
                >
                  {owner.isOpen ? 'Open' : 'Closed'}
                </span>
              </td>

              <td>
                <button
                  className="admin-view-button"
                  onClick={() => onViewOwner(owner)}
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default OwnersTable;
