function CustomersToolbar({
  search,
  onSearchChange,
  filteredCount,
  totalCount,
}) {
  return (
    <div className="admin-customers-toolbar">
      <input
        type="text"
        placeholder="Search name, phone, address..."
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
      />

      <span>
        Showing {filteredCount} of {totalCount}
      </span>
    </div>
  );
}

export default CustomersToolbar;
