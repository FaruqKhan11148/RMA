import { X } from 'lucide-react';

function OwnerEarningsDetailsModal({ order, onClose }) {
  if (!order) {
    return null;
  }

  return (
    <div className="owner_earnings_modal_overlay" onClick={onClose}>
      <div
        className="owner_earnings_modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="owner_earnings_modal_header">
          <div>
            <span>Order Earnings</span>
            <h2>{order.orderId}</h2>
          </div>

          <button
            type="button"
            className="owner_earnings_modal_close"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <div className="owner_earnings_modal_content">
          <h3>Owner Earnings</h3>

          <p>Product Sales: ₹{Number(order.productSubtotal || 0).toFixed(2)}</p>

          <p>RMA Fee: -₹{Number(order.rmaFee || 0).toFixed(2)}</p>

          <p>Your Earnings: ₹{Number(order.ownerAmount || 0).toFixed(2)}</p>

          <hr />

          <p>
            Delivery Charge: ₹{Number(order.deliveryCharge || 0).toFixed(2)}
          </p>

          <p>PayU Fee: ₹{Number(order.payuFee || 0).toFixed(2)}</p>

          <p>PayU GST: ₹{Number(order.payuGst || 0).toFixed(2)}</p>

          <p>PayU Charges: ₹{Number(order.payuCharges || 0).toFixed(2)}</p>

          <hr />

          <p>
            Customer Paid: ₹
            {Number(order.customerPayableAmount || 0).toFixed(2)}
          </p>
        </div>

        <div className="owner_earnings_modal_footer">
          <button type="button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default OwnerEarningsDetailsModal;
