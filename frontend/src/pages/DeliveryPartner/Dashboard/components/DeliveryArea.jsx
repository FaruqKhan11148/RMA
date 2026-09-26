import { MapPin } from 'lucide-react';

function DeliveryArea({ todayOrders }) {
  return (
    <section className="delivery_section">
      <div className="delivery_section_header">
        <div>
          <h2>Delivery Area</h2>

          <span>Your delivery activity</span>
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
    </section>
  );
}

export default DeliveryArea;
