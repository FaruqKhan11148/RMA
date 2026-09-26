function OwnersToolbar({ search, filteredCount, totalCount, onSearchChange }) {
  return (
    <div className="admin-owner-toolbar">
      <input
        type="text"
        placeholder="Search owner, shop or Shop ID..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />

      <span>
        Showing {filteredCount} of {totalCount}
      </span>
    </div>
  );
}

export default OwnersToolbar;
