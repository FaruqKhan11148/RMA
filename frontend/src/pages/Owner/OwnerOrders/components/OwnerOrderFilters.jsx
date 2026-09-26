function OwnerOrderFilters({
  filters,
  activeFilter,
  setActiveFilter,
  getCount,
}) {
  return (
    <section className="owner_order_filters">
      <div className="owner_filter_buttons">
        {filters.map((filter) => (
          <button
            key={filter}
            className={`owner_filter_button ${
              activeFilter === filter ? 'active' : ''
            }`}
            onClick={() => setActiveFilter(filter)}
          >
            {filter}

            <span>{getCount(filter)}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

export default OwnerOrderFilters;
