import { Power } from 'lucide-react';

function DeliveryStatusCard({ isOnline, onToggle }) {
  return (
    <section className="delivery_status_card">
      <div className="delivery_status_icon">
        <Power size={21} />
      </div>

      <div className="delivery_status_content">
        <strong>{isOnline ? 'You are available' : 'You are offline'}</strong>

        <span>
          {isOnline
            ? 'You can receive delivery requests.'
            : 'Go online to receive delivery requests.'}
        </span>
      </div>

      <button
        type="button"
        className={`delivery_toggle ${isOnline ? 'active' : ''}`}
        onClick={onToggle}
        aria-label={isOnline ? 'Go offline' : 'Go online'}
      >
        <span />
      </button>
    </section>
  );
}

export default DeliveryStatusCard;
