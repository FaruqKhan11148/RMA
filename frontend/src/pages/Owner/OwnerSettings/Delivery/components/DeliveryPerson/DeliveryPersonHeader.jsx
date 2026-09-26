function DeliveryPersonHeader({ registered }) {
  return (
    <>
      <h1>{registered ? 'Delivery Person' : 'Register Delivery Person'}</h1>

      <p>
        {registered
          ? 'Your shop already has a delivery person registered.'
          : 'Register a delivery person who will deliver orders for your shop.'}
      </p>
    </>
  );
}

export default DeliveryPersonHeader;
