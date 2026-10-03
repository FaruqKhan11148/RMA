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

  const getAvailabilityLabel = (person) => {
    if (!person.isActive) {
      return 'Inactive';
    }

    switch (person.availabilityStatus) {
      case 'AVAILABLE':
        return 'Available';

      case 'BUSY':
        return 'Busy';

      case 'OFFLINE':
      default:
        return 'Offline';
    }
  };

  const getAvailabilityClass = (person) => {
    if (!person.isActive) {
      return 'inactive';
    }

    switch (person.availabilityStatus) {
      case 'AVAILABLE':
        return 'available';

      case 'BUSY':
        return 'busy';

      case 'OFFLINE':
      default:
        return 'offline';
    }
  };

  return (
    <div className="delivery-table-wrapper">
      <table className="delivery-table">
        <thead>
          <tr>
            <th>Delivery Person</th>
            <th>Phone</th>
            <th>Availability</th>
            <th>Active Orders</th>
            <th>Completed</th>
            <th>Total Orders</th>
            <th>Application</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {filteredDeliveryPersons.map((person) => {
            return (
              <tr key={person._id}>
                <td>
                  <div className="delivery-person-cell">
                    <strong>{person.name}</strong>

                    <span>
                      {person.deliveryType === 'RMA'
                        ? 'RMA Delivery Partner'
                        : person.shopId || '—'}
                    </span>
                  </div>
                </td>

                <td>{person.phone || '—'}</td>

                <td>
                  <span
                    className={`delivery-status ${getAvailabilityClass(
                      person,
                    )}`}
                  >
                    {getAvailabilityLabel(person)}
                  </span>
                </td>

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
                    className={`delivery-status ${
                      person.applicationStatus?.toLowerCase() || ''
                    }`}
                  >
                    {person.applicationStatus || '—'}
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
