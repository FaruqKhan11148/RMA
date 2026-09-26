import { useEffect, useState } from 'react';

import OrderLocationMap from '../../../../components/map/OrderLocationMap';

import { fetchDeliveryRoute } from '../utils/deliveryOrdersApi';

function DeliveryOrderDetails({ order, onBack, onVerifyOtp, currentLocation }) {
  const [otp, setOtp] = useState('');
  const [route, setRoute] = useState(null);
  const [routeLoading, setRouteLoading] = useState(true);
  const [routeError, setRouteError] = useState('');

  useEffect(() => {
    const loadRoute = async () => {
      try {
        setRouteLoading(true);
        setRouteError('');

        const token = sessionStorage.getItem('delivery_token');

        const data = await fetchDeliveryRoute(token, order.orderId);

        setRoute(data.route);
      } catch (error) {
        console.error('Failed to fetch delivery route:', error);

        setRouteError(error.message);
      } finally {
        setRouteLoading(false);
      }
    };

    loadRoute();
  }, [order.orderId]);

  const handleSubmitOtp = () => {
    if (!otp.trim()) {
      alert('Please enter the delivery OTP.');
      return;
    }

    onVerifyOtp(order.orderId, otp);
  };

  return (
    <div className="delivery_order_details">
      <div className="delivery_details_header">
        <button type="button" className="delivery_back_button" onClick={onBack}>
          <span className="delivery_back_icon">←</span>

          <span>Back to Orders</span>
        </button>

        <div className="delivery_details_header_main">
          <div className="delivery_details_heading">
            <span>DELIVERY ORDER</span>

            <h2>#{order.orderId}</h2>
          </div>

          <div className="delivery_details_status">
            <span>
              {order.status === 'Completed'
                ? 'Completed'
                : order.status === 'OutForDelivery'
                  ? 'Out for Delivery'
                  : order.status}
            </span>
          </div>
        </div>
      </div>

      <section className="delivery_details_section">
        <h3>Customer</h3>

        <div className="delivery_customer_details">
          <div>
            <span>Name</span>

            <strong>{order.customer?.name || 'Customer'}</strong>
          </div>

          <div>
            <span>Phone</span>

            <a href={`tel:${order.customer?.phone}`}>
              {order.customer?.phone || 'Not available'}
            </a>
          </div>
        </div>
      </section>

      <section className="delivery_details_section">
        <h3>Delivery Address</h3>

        <p className="delivery_address">
          {order.deliveryAddress || order.address || 'Address not available'}
        </p>
      </section>

      <section className="delivery_details_section">
        <h3>Route</h3>

        {!order.deliveryLocation?.latitude ||
        !order.deliveryLocation?.longitude ? (
          <div className="delivery_route_error">
            Delivery location is not available for this order.
          </div>
        ) : routeLoading ? (
          <div className="delivery_route_message">Loading route...</div>
        ) : routeError ? (
          <div className="delivery_route_error">{routeError}</div>
        ) : (
          <>
            <div className="delivery_map_container">
              <OrderLocationMap
                latitude={order.deliveryLocation.latitude}
                longitude={order.deliveryLocation.longitude}
                route={route}
                currentLocation={currentLocation}
              />
            </div>

            {order.deliveryDistance && (
              <div className="delivery_distance">
                Distance: {Number(order.deliveryDistance).toFixed(2)} km
              </div>
            )}
          </>
        )}
      </section>

      <section className="delivery_details_section">
        <h3>Order Items</h3>

        <div className="delivery_order_items">
          {order.items?.map((item, index) => (
            <div
              className="delivery_order_item"
              key={`${item.productId || item.name}-${index}`}
            >
              <div>
                <strong>{item.name || item.productName}</strong>

                <span>Qty: {item.quantity}</span>
              </div>

              <strong>
                ₹
                {Number(
                  item.total || item.price * item.quantity || item.price || 0,
                ).toFixed(2)}
              </strong>
            </div>
          ))}
        </div>

        <div className="delivery_details_total">
          <span>Total</span>

          <strong>₹{Number(order.totalPrice || 0).toFixed(2)}</strong>
        </div>
      </section>

      {order.status === 'OutForDelivery' && (
        <section className="delivery_details_section delivery_otp_section">
          <h3>Customer OTP</h3>

          <p>
            Ask the customer for the delivery OTP before completing the
            delivery.
          </p>

          <div className="delivery_otp_action">
            <input
              type="text"
              value={otp}
              onChange={(event) => setOtp(event.target.value)}
              placeholder="Enter OTP"
              maxLength={6}
            />

            <button type="button" onClick={handleSubmitOtp}>
              Verify & Deliver
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

export default DeliveryOrderDetails;
