import { CheckCircle2, MapPin, Package, IndianRupee } from 'lucide-react';

import {
  formatAmount,
  formatDate,
  formatTime,
  getItemCount,
} from '../utils/historyHelpers';

function HistoryCard({ order }) {
  const completedDate = order.completedAt || order.createdAt;

  const itemCount = getItemCount(order);

  return (
    <article className="delivery_history_card" key={order.orderId}>
      {/* TOP */}

      <div className="delivery_history_top">
        <div className="delivery_history_order">
          <div className="delivery_history_status_icon">
            <CheckCircle2 size={18} />
          </div>

          <div>
            <strong>#{order.orderId}</strong>

            <span>
              {formatDate(completedDate)}
              {formatTime(completedDate)
                ? ` • ${formatTime(completedDate)}`
                : ''}
            </span>
          </div>
        </div>

        <span className="delivery_history_completed">Completed</span>
      </div>

      {/* DETAILS */}

      <div className="delivery_history_details">
        <div className="delivery_history_detail">
          <Package size={16} />

          <div>
            <span>Items</span>

            <strong>
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </strong>
          </div>
        </div>

        <div className="delivery_history_detail">
          <MapPin size={16} />

          <div>
            <span>Distance</span>

            <strong>
              {order.deliveryDistance != null
                ? `${Number(order.deliveryDistance).toFixed(2)} km`
                : '—'}
            </strong>
          </div>
        </div>
      </div>

      {/* CUSTOMER */}

      <div className="delivery_history_customer">
        <span>Customer</span>

        <strong>{order.customer?.name || 'Customer'}</strong>
      </div>

      {/* EARNINGS */}

      <div className="delivery_history_bottom">
        <div>
          <span>Delivery Earnings</span>
        </div>

        <strong>
          <IndianRupee size={15} />

          {formatAmount(order.deliveryRiderAmount)}
        </strong>
      </div>
    </article>
  );
}

export default HistoryCard;
