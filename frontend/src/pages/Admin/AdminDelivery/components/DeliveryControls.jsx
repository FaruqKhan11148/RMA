function DeliveryControls({
  search,
  statusFilter,
  onSearchChange,
  onStatusFilterChange,
}) {
  return (
    <div className="delivery-controls">
      <input
        type="text"
        placeholder="Search delivery partner, phone..."
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
      />

      <select
        value={statusFilter}
        onChange={(event) => onStatusFilterChange(event.target.value)}
      >
        <option value="ALL">All Partners</option>
        <option value="AVAILABLE">Available</option>
        <option value="BUSY">Busy</option>
        <option value="OFFLINE">Offline</option>
        <option value="ACTIVE">Active Account</option>
        <option value="INACTIVE">Inactive Account</option>
      </select>
    </div>
  );
}

export default DeliveryControls;
