function OwnerOrdersError({ error }) {
  return (
    <main className="owner_orders">
      <section className="owner_no_orders">
        <h2>Unable to load orders</h2>

        <p>{error}</p>
      </section>
    </main>
  );
}

export default OwnerOrdersError;
