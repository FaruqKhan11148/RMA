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
        placeholder="Search delivery person, shop, owner, phone..."
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
      />

      <select
        value={statusFilter}
        onChange={(event) => onStatusFilterChange(event.target.value)}
      >
        <option value="ALL">All Persons</option>
        <option value="ACTIVE">Active</option>
        <option value="INACTIVE">Inactive</option>
      </select>
    </div>
  );
}

export default DeliveryControls;
