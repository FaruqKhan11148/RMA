import { Package } from 'lucide-react';

import OwnerEarningsOrderCard from './OwnerEarningsOrderCard';

function OwnerRecentOrders({ recentOrders }) {
  return (
    <section className="owner_earnings_orders">
      <div className="owner_earnings_section_header">
        <h2>Recent Orders</h2>
      </div>

      {recentOrders.length === 0 ? (
        <div className="owner_earnings_empty">
          <Package size={30} />
          <p>No earnings yet.</p>
        </div>
      ) : (
        <div className="owner_earnings_order_list">
          {recentOrders.map((order) => (
            <OwnerEarningsOrderCard key={order.orderId} order={order} />
          ))}
        </div>
      )}
    </section>
  );
}

export default OwnerRecentOrders;
