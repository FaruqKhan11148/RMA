import { Clock3 } from 'lucide-react';

function DeliveryRequests({ pending }) {
  return (
    <section className="delivery_section">
      <div className="delivery_section_header">
        <div>
          <h2>Delivery Requests</h2>

          <span>New orders waiting for pickup</span>
        </div>

        <span className="delivery_request_count">{pending}</span>
      </div>

      {pending > 0 ? (
        <div className="delivery_request_card">
          <div className="delivery_request_icon">
            <Clock3 size={21} />
          </div>

          <div>
            <strong>
              {pending} active delivery
              {pending === 1 ? '' : 'ies'}
            </strong>

            <p>You have assigned deliveries waiting to be completed.</p>
          </div>
        </div>
      ) : (
        <div className="delivery_empty_card compact">
          <div className="delivery_empty_icon">
            <Clock3 size={23} />
          </div>

          <strong>No active requests</strong>

          <p>New delivery assignments will appear here.</p>
        </div>
      )}
    </section>
  );
}

export default DeliveryRequests;
