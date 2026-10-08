import { useState } from 'react';
import { Package } from 'lucide-react';

import OwnerEarningsOrderCard from './OwnerEarningsOrderCard';
import OwnerEarningsDetailsModal from './OwnerEarningsDetailsModal';

function OwnerRecentOrders({ recentEarnings = [] }) {
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
  };

  return (
    <>
      <section className="owner_earnings_orders">
        <div className="owner_earnings_section_header">
          <h2>Recent Earnings</h2>
        </div>

        {recentEarnings.length === 0 ? (
          <div className="owner_earnings_empty">
            <Package size={30} />
            <p>No earnings yet.</p>
          </div>
        ) : (
          <div className="owner_earnings_order_list">
            {recentEarnings.map((order) => (
              <OwnerEarningsOrderCard
                key={order.orderId}
                order={order}
                onClick={handleSelectOrder}
              />
            ))}
          </div>
        )}
      </section>

      {selectedOrder ? (
        <OwnerEarningsDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      ) : null}
    </>
  );
}

export default OwnerRecentOrders;
