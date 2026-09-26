function OrderDetails({ order, shopName }) {
  return (
    <section className="order_details">
      <h2>Order Details</h2>

      <p>
        <strong>Order ID:</strong>

        <span>{order.orderId}</span>
      </p>

      <p>
        <strong>Shop:</strong>

        <span>{shopName}</span>
      </p>

      <p>
        <strong>Order Type:</strong>

        <span>Delivery</span>
      </p>

      <p>
        <strong>Payment:</strong>

        <span>Online Payment</span>
      </p>

      <p>
        <strong>Total Paid:</strong>

        <span>
          ₹{Number(order.customerPayableAmount || order.totalPrice).toFixed(2)}
        </span>
      </p>
    </section>
  );
}

export default OrderDetails;
