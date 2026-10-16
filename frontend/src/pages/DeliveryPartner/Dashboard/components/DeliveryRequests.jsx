import { CheckCircle2, Clock3 } from 'lucide-react';

function DeliveryRequests({ pending = 0, completed = 0 }) {
  return (
    <section className="delivery_section">
      <div className="delivery_section_header">
        <div>
          <h2>Today's Delivery Progress</h2>
          <span>Your accepted and completed orders today</span>
        </div>

        <span className="delivery_request_count">{pending}</span>
      </div>

      <div className="delivery_request_card">
        <div className="delivery_request_icon">
          <Clock3 size={21} />
        </div>

        <div>
          <strong>
            {pending} active order{pending === 1 ? '' : 's'}
          </strong>

          <p>Orders currently ready for pickup or out for delivery.</p>
        </div>
      </div>

      <div className="delivery_request_card">
        <div className="delivery_request_icon">
          <CheckCircle2 size={21} />
        </div>

        <div>
          <strong>
            {completed} completed order{completed === 1 ? '' : 's'}
          </strong>

          <p>Orders successfully delivered today.</p>
        </div>
      </div>
    </section>
  );
}

export default DeliveryRequests;
