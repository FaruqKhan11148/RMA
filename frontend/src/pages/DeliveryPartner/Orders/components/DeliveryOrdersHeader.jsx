function DeliveryOrdersHeader({ deliveryPerson, shopId, onLogout }) {
  return (
    <section className="delivery_orders_header">
      <h1>Welcome, {deliveryPerson?.name || 'Delivery Partner'}</h1>

      <p>
        Shop ID: <strong>{deliveryPerson?.shopId || shopId}</strong>
      </p>

      <button className="delivery_complete_button" onClick={onLogout}>
        Logout
      </button>
    </section>
  );
}

export default DeliveryOrdersHeader;
