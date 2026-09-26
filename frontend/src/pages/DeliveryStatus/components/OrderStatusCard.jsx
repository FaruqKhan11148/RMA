import StatusSteps from './StatusSteps';

function OrderStatusCard({ order, getStatusMessage }) {
  return (
    <section className="order_status_card">
      <div className="status_icon">✓</div>

      <h2>{order.status}</h2>

      <p>{getStatusMessage(order.status)}</p>

      <StatusSteps currentStatus={order.status} />
    </section>
  );
}

export default OrderStatusCard;
