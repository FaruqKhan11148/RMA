function RateOrderHeader({ shopName, orderId }) {
  return (
    <section className="rate_order_header">
      <h1>Rate Your Order</h1>

      <p>How was your experience with RMA?</p>

      <div className="rate_order_shop">
        <strong>{shopName}</strong>

        <span>Order #{orderId}</span>
      </div>
    </section>
  );
}

export default RateOrderHeader;
