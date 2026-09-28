function OrdersHeader({
  selectionMode,
  selectedCount,
  totalOrders,
  completedOrdersCount,
  deleting,
  onSelect,
  onCancelSelection,
  onSelectAll,
  onDeleteSelected,
}) {
  const allSelected =
    completedOrdersCount > 0 && selectedCount === completedOrdersCount;

  return (
    <div className="orders_header">
      <div className="orders_header_top">
        <div>
          <h1>My Orders</h1>

          <p>
            {selectionMode
              ? `${selectedCount} ${
                  selectedCount === 1 ? 'order' : 'orders'
                } selected`
              : 'Track and manage your recent orders.'}
          </p>
        </div>

        {!selectionMode ? (
          <button
            type="button"
            className="orders_select_button"
            onClick={onSelect}
            disabled={completedOrdersCount === 0}
          >
            Select
          </button>
        ) : (
          <button
            type="button"
            className="orders_cancel_button"
            onClick={onCancelSelection}
            disabled={deleting}
          >
            Cancel
          </button>
        )}
      </div>

      {selectionMode && (
        <div className="orders_selection_actions">
          <button
            type="button"
            className="orders_select_all_button"
            onClick={onSelectAll}
            disabled={deleting || completedOrdersCount === 0}
          >
            {allSelected ? 'Unselect All' : 'Select All'}
          </button>

          <button
            type="button"
            className="orders_delete_button"
            onClick={onDeleteSelected}
            disabled={selectedCount === 0 || deleting}
          >
            {deleting
              ? 'Deleting...'
              : `Delete${selectedCount > 0 ? ` (${selectedCount})` : ''}`}
          </button>
        </div>
      )}
    </div>
  );
}

export default OrdersHeader;
