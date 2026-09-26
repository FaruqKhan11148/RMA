function OrderSheet({
  selectedOrder,
  showOrderSheet,
  closeOrderSheet,
  handleViewOrder,
}) {
  if (!showOrderSheet || !selectedOrder) {
    return null;
  }

  return (
    <div className="order_sheet_overlay" onClick={closeOrderSheet}>
      <section
        className="order_sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="order_sheet_title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="order_sheet_handle" />

        <div className="order_sheet_header">
          <div>
            <span>Order Details</span>

            <h2 id="order_sheet_title">{selectedOrder.orderId}</h2>
          </div>

          <button
            type="button"
            className="order_sheet_close"
            onClick={closeOrderSheet}
            aria-label="Close order details"
          >
            ×
          </button>
        </div>

        <div className="order_sheet_status">
          <span>Status : </span>

          <strong>{selectedOrder.status}</strong>
        </div>

        <div className="order_sheet_details">
          <div className="order_sheet_detail">
            <span>Shop</span>

            <strong>
              {selectedOrder.ownerId?.shopName ||
                selectedOrder.ownerId?.ownerName ||
                'Shop'}
            </strong>
          </div>

          <div className="order_sheet_detail">
            <span>Items</span>

            <strong>
              {selectedOrder.totalItems}{' '}
              {selectedOrder.totalItems === 1 ? 'item' : 'items'}
            </strong>
          </div>

          <div className="order_sheet_detail">
            <span>Order Type</span>

            <strong>Delivery</strong>
          </div>

          <div className="order_sheet_detail">
            <span>Payment</span>

            <strong>Online Payment</strong>
          </div>

          <div className="order_sheet_detail order_sheet_total">
            <span>Total</span>

            <strong>
              ₹
              {Number(
                selectedOrder.customerPayableAmount ??
                  selectedOrder.totalPrice ??
                  0,
              ).toFixed(2)}
            </strong>
          </div>
        </div>

        <button
          type="button"
          className="order_sheet_button"
          onClick={handleViewOrder}
        >
          View Order Status
        </button>
      </section>
    </div>
  );
}

export default OrderSheet;
