import { Package } from 'lucide-react';

function HistoryError({ error }) {
  return (
    <section className="delivery_history_empty">
      <div className="delivery_history_empty_icon">
        <Package size={24} />
      </div>

      <strong>{error}</strong>

      <p>Please refresh the page and try again.</p>
    </section>
  );
}

export default HistoryError;
