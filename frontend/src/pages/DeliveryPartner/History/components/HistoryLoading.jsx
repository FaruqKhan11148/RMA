import { Clock3 } from 'lucide-react';

function HistoryLoading() {
  return (
    <section className="delivery_history_empty">
      <div className="delivery_history_empty_icon">
        <Clock3 size={24} />
      </div>

      <strong>Loading history...</strong>

      <p>Please wait while we load your completed deliveries.</p>
    </section>
  );
}

export default HistoryLoading;
