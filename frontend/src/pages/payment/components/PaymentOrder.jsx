function PaymentOrder({ order }) {
  return (
    <section className="payment_order">
      <div>
        <span>Shop</span>

        <strong>{order.ownerId?.shopName || 'Shop'}</strong>
      </div>

      <div>
        <span>Order ID</span>

        <strong>{order.orderId}</strong>
      </div>
    </section>
  );
}

export default PaymentOrder;
