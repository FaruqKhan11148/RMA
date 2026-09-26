function StatusHeader({ order }) {
  return (
    <section className="delivery_status_header">
      <h1>
        {order.status === 'Completed' ? 'Order Completed!' : 'Order Status'}
      </h1>

      <p>Track your order from the shop.</p>
    </section>
  );
}

export default StatusHeader;
