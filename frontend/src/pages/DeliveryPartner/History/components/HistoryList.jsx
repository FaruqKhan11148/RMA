import HistoryCard from './HistoryCard';

function HistoryList({ orders }) {
  return (
    <section className="delivery_history_list">
      {orders.map((order) => (
        <HistoryCard key={order.orderId} order={order} />
      ))}
    </section>
  );
}

export default HistoryList;
