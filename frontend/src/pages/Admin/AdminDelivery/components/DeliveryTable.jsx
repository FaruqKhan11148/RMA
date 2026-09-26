function DeliveryTable({ loading, filteredDeliveryPersons, onViewDetails }) {
  if (loading) {
    return <div className="delivery-loading">Loading delivery persons...</div>;
  }

  if (filteredDeliveryPersons.length === 0) {
    return (
      <div className="delivery-empty">
        <h3>No delivery persons found</h3>
        <p>No delivery person matches the current search or filter.</p>
      </div>
    );
  }

  return (
    <div className="delivery-table-wrapper">
      <table className="delivery-table">
        <thead>
          <tr>
            <th>Delivery Person</th>
            <th>Shop</th>
            <th>Owner</th>
            <th>Phone</th>
            <th>Active Orders</th>
            <th>Completed</th>
            <th>Total Orders</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {filteredDeliveryPersons.map((person) => {
            const owner = person.ownerId || {};

            return (
              <tr key={person._id}>
                <td>
                  <div className="delivery-person-cell">
                    <strong>{person.name}</strong>
                    <span>{person.shopId}</span>
                  </div>
                </td>

                <td>{owner.shopName || '—'}</td>

                <td>{owner.ownerName || '—'}</td>

                <td>{person.phone || '—'}</td>

                <td>
                  <span className="order-count active">
                    {person.activeOrders || 0}
                  </span>
                </td>

                <td>
                  <span className="order-count completed">
                    {person.completedOrders || 0}
                  </span>
                </td>

                <td>{person.totalDeliveryOrders || 0}</td>

                <td>
                  <span
                    className={
                      person.isActive
                        ? 'delivery-status active'
                        : 'delivery-status inactive'
                    }
                  >
                    {person.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>

                <td>
                  <button
                    className="view-delivery-button"
                    onClick={() => onViewDetails(person)}
                  >
                    View
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default DeliveryTable;
