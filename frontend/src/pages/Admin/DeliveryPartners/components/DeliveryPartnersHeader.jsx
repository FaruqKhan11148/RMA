function DeliveryPartnersHeader({ counts, activeFilter, onFilterChange }) {
  const filters = [
    {
      key: 'ALL',
      label: 'All',
    },
    {
      key: 'INCOMPLETE',
      label: 'Incomplete',
    },
    {
      key: 'SUBMITTED',
      label: 'Submitted',
    },
    {
      key: 'UNDER_REVIEW',
      label: 'Under Review',
    },
    {
      key: 'CORRECTION_REQUIRED',
      label: 'Correction Required',
    },
    {
      key: 'APPROVED',
      label: 'Approved',
    },
    {
      key: 'REJECTED',
      label: 'Rejected',
    },
  ];

  return (
    <div className="admin_delivery_partners_header">
      <div className="admin_delivery_partners_header_top">
        <div>
          <h1>Delivery Partners</h1>

          <p>Manage all RMA delivery partners and applications.</p>
        </div>
      </div>

      <div className="admin_delivery_partner_filters">
        {filters.map((filter) => (
          <button
            key={filter.key}
            type="button"
            className={`admin_delivery_partner_filter ${
              activeFilter === filter.key ? 'active' : ''
            }`}
            onClick={() => onFilterChange(filter.key)}
          >
            <span>{counts[filter.key]}</span>
            <small>{filter.label}</small>
          </button>
        ))}
      </div>
    </div>
  );
}

export default DeliveryPartnersHeader;
