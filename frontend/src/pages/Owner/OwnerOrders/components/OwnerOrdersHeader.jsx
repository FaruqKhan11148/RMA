function OwnerOrdersHeader({ navigate }) {
  return (
    <section className="owner_orders_header">
      <div>
        <button
          className="owner_orders_back"
          onClick={() => navigate('/owner/dashboard')}
        >
          ← Back
        </button>

        <h1>Manage Orders</h1>

        <p>View and manage all your shop orders.</p>
      </div>
    </section>
  );
}

export default OwnerOrdersHeader;
