import { MapPin, Package } from 'lucide-react';

function DeliveryArea({ todayOrders = 0, activeCount = 0, maxOrders = 6 }) {
  const safeActiveCount = Math.max(0, Number(activeCount) || 0);
  const safeMaxOrders = Math.max(1, Number(maxOrders) || 6);
  const availableSlots = Math.max(0, safeMaxOrders - safeActiveCount);
  const workloadPercentage = Math.min(
    100,
    (safeActiveCount / safeMaxOrders) * 100,
  );

  return (
    <section className="delivery_section">
      <div className="delivery_section_header">
        <div>
          <h2>Delivery Overview</h2>
          <span>Your daily activity and current workload</span>
        </div>
      </div>

      <div className="delivery_area_card">
        <div className="delivery_area_icon">
          <MapPin size={21} />
        </div>

        <div>
          <strong>Today's delivery activity</strong>

          <p>
            {todayOrders === 0
              ? 'No delivery orders have been assigned today.'
              : `${todayOrders} delivery ${
                  todayOrders === 1 ? 'order' : 'orders'
                } assigned today.`}
          </p>
        </div>
      </div>

      <div className="delivery_area_card delivery_workload_card">
        <div className="delivery_area_icon">
          <Package size={21} />
        </div>

        <div className="delivery_workload_content">
          <strong>Current delivery workload</strong>

          <p>
            {safeActiveCount} of {safeMaxOrders} active orders
          </p>

          <div
            className="delivery_workload_track"
            role="progressbar"
            aria-label="Active delivery workload"
            aria-valuemin={0}
            aria-valuemax={safeMaxOrders}
            aria-valuenow={Math.min(safeActiveCount, safeMaxOrders)}
          >
            <div
              className="delivery_workload_fill"
              style={{ width: `${workloadPercentage}%` }}
            />
          </div>

          <span className="delivery_workload_info">
            {availableSlots === 0
              ? 'Maximum active order capacity reached.'
              : `${availableSlots} order ${
                  availableSlots === 1 ? 'slot' : 'slots'
                } available.`}
          </span>
        </div>
      </div>
    </section>
  );
}

export default DeliveryArea;
