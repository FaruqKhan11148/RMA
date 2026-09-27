function DeliveryOrdersHeader({ deliveryPerson, shopId, onLogout }) {
  return (
    <section className="delivery_orders_header">
      <div className="delivery_orders_header_sub1">
        <h1>Welcome, {deliveryPerson?.name || 'Delivery Partner'}</h1>

        <p>
          Shop ID: <strong>{deliveryPerson?.shopId || shopId}</strong>
        </p>
      </div>

      <div className="delivery_orders_header_sub2">
        <button className="delivery_complete_button" onClick={onLogout}>
          Logout
        </button>
      </div>
    </section>
  );
}

export default DeliveryOrdersHeader;
