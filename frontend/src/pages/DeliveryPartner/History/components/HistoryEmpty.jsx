import { Package } from 'lucide-react';

function HistoryEmpty() {
  return (
    <section className="delivery_history_empty">
      <div className="delivery_history_empty_icon">
        <Package size={24} />
      </div>

      <strong>No delivery history</strong>

      <p>Your completed deliveries will appear here.</p>
    </section>
  );
}

export default HistoryEmpty;
