import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

import OrderLocationMap from '../../../../components/map/OrderLocationMap';

import {
  fetchDeliveryRoute,
  collectDeliveryOrder,
  fetchDeliveryChargePayment,
} from '../utils/deliveryOrdersApi';

function DeliveryOrderDetails({
  order,
  onBack,
  onVerifyOtp,
  onCollected,
  currentLocation,
}) {
  const [otp, setOtp] = useState('');
  const [route, setRoute] = useState(null);
  const [routeLoading, setRouteLoading] = useState(true);
  const [routeError, setRouteError] = useState('');
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const [collecting, setCollecting] = useState(false);

  const [rmaCollectionPayment, setRmaCollectionPayment] = useState(
    order.rmaCollectionPayment || null,
  );
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  const isCollected = order.deliveryPickupStatus === 'COLLECTED';

  const destination = isCollected
    ? order.deliveryLocation
    : order.pickupLocation;

  const destinationTitle = isCollected
    ? 'Delivery Address'
    : 'Pickup From Shop';

  const routeTitle = isCollected ? 'Route to Customer' : 'Route to Shop';

  const distance = isCollected ? order.deliveryDistance : null;

  useEffect(() => {
    const loadRoute = async () => {
      try {
        setRouteLoading(true);
        setRouteError('');
        setRoute(null);

        const token = localStorage.getItem('delivery_token');

        const data = await fetchDeliveryRoute(token, order.orderId, {
          destinationType: isCollected ? 'customer' : 'pickup',
        });

        setRoute(data.route);
      } catch (error) {
        console.error('Failed to fetch delivery route:', error);

        setRouteError(error.message);
      } finally {
        setRouteLoading(false);
      }
    };

    if (
      destination?.latitude !== undefined &&
      destination?.longitude !== undefined
    ) {
      loadRoute();
    } else {
      setRouteLoading(false);
      setRouteError(
        isCollected
          ? 'Customer delivery location is not available for this order.'
          : 'Shop pickup location is not available for this order.',
      );
    }
  }, [
    order.orderId,
    order.deliveryPickupStatus,
    isCollected,
    destination?.latitude,
    destination?.longitude,
  ]);

  useEffect(() => {
    let cancelled = false;
    let intervalId;

    const loadRmaCollectionPayment = async (showLoader = false) => {
      if (
        order.orderType !== 'delivery' ||
        order.deliveryAssignmentType !== 'RMA' ||
        order.deliveryAssignmentStatus !== 'ACCEPTED' ||
        order.deliveryPickupStatus === 'COLLECTED'
      ) {
        return;
      }

      try {
        if (showLoader) {
          setPaymentLoading(true);
        }

        setPaymentError('');

        const token = localStorage.getItem('delivery_token');
        const data = await fetchDeliveryChargePayment(token, order.orderId);

        if (!cancelled) {
          setRmaCollectionPayment(
            data.payment ||
              data.rmaCollectionPayment ||
              data.order?.rmaCollectionPayment ||
              null,
          );
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to load RMA collection payment:', error);
          setPaymentError(
            error.message || 'Unable to load RMA payment details.',
          );
        }
      } finally {
        if (!cancelled && showLoader) {
          setPaymentLoading(false);
        }
      }
    };

    loadRmaCollectionPayment(true);

    intervalId = setInterval(() => {
      loadRmaCollectionPayment(false);
    }, 10000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [
    order.orderId,
    order.orderType,
    order.deliveryAssignmentType,
    order.deliveryAssignmentStatus,
    order.deliveryPickupStatus,
  ]);

  const handleCollectOrder = async () => {
    if (collecting) return;

    if (rmaCollectionPayment?.status !== 'CONFIRMED') {
      alert(
        'RMA admin must confirm the payment before you can collect this order.',
      );
      return;
    }

    try {
      setCollecting(true);

      const token = localStorage.getItem('delivery_token');
      const data = await collectDeliveryOrder(token, order.orderId);

      if (data?.order && onCollected) {
        onCollected(data.order);
      }
    } catch (error) {
      console.error('Failed to collect delivery order:', error);
      alert(error.message || 'Failed to collect order.');
    } finally {
      setCollecting(false);
    }
  };

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
        <h3>{destinationTitle}</h3>

        <p className="delivery_address">
          {destination?.address || 'Address not available'}
        </p>
      </section>

      <section className="delivery_details_section">
        <h3>{routeTitle}</h3>

        {!destination?.latitude || !destination?.longitude ? (
          <div className="delivery_route_error">
            {isCollected
              ? 'Customer delivery location is not available for this order.'
              : 'Shop pickup location is not available for this order.'}
          </div>
        ) : routeLoading ? (
          <div className="delivery_route_message">Loading route...</div>
        ) : routeError ? (
          <div className="delivery_route_error">{routeError}</div>
        ) : (
          <>
            <div
              className="delivery_map_container"
              onClick={() => setIsMapFullscreen(true)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  setIsMapFullscreen(true);
                }
              }}
            >
              <OrderLocationMap
                latitude={destination.latitude}
                longitude={destination.longitude}
                route={route}
                currentLocation={currentLocation}
              />

              <div className="delivery_map_expand_hint">
                <span>Open full map</span>
              </div>
            </div>

            {distance && (
              <div className="delivery_distance">
                Distance: {Number(distance).toFixed(2)} km
              </div>
            )}
          </>
        )}
      </section>

      {isMapFullscreen && (
        <div className="delivery_fullscreen_map">
          <button
            type="button"
            className="delivery_fullscreen_map_close"
            onClick={() => setIsMapFullscreen(false)}
            aria-label="Close full screen map"
          >
            ×
          </button>

          <OrderLocationMap
            latitude={destination.latitude}
            longitude={destination.longitude}
            route={route}
            currentLocation={currentLocation}
            fullscreen
          />

          <div className="delivery_fullscreen_map_info">
            <strong>{routeTitle}</strong>

            {distance && <span>{Number(distance).toFixed(2)} km</span>}
          </div>
        </div>
      )}

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

      {!isCollected &&
        order.deliveryAssignmentType === 'RMA' &&
        order.deliveryAssignmentStatus === 'ACCEPTED' &&
        order.deliveryPickupStatus === 'PENDING' &&
        order.status === 'Ready' && (
          <section className="delivery_details_section delivery_charge_payment">
            <h3>RMA Payment Verification</h3>

            <p className="delivery_charge_amount">
              Owner must pay RMA:{' '}
              <strong>
                ₹{Number(rmaCollectionPayment?.amount ?? 0).toFixed(2)}
              </strong>
            </p>

            {paymentLoading ? (
              <p>Loading RMA payment details...</p>
            ) : paymentError ? (
              <p className="delivery_payment_error" role="alert">
                {paymentError}
              </p>
            ) : rmaCollectionPayment?.status === 'CONFIRMED' ? (
              <p className="delivery_payment_confirmed">
                RMA admin has confirmed payment. You can collect the order.
              </p>
            ) : rmaCollectionPayment?.status === 'OWNER_MARKED_PAID' ? (
              <p>
                The shop owner has marked the payment as sent. Waiting for RMA
                admin to verify receipt. You cannot collect the order yet.
              </p>
            ) : rmaCollectionPayment?.status === 'DISPUTED' ? (
              <p className="delivery_payment_error" role="alert">
                This payment is under review by RMA. Contact the administrator
                before collecting the order.
              </p>
            ) : rmaCollectionPayment?.status === 'PENDING' &&
              rmaCollectionPayment?.upiId &&
              Number(rmaCollectionPayment?.amount) > 0 ? (
              <>
                <div className="delivery_payment_qr">
                  <QRCodeSVG
                    value={`upi://pay?pa=${encodeURIComponent(
                      rmaCollectionPayment.upiId,
                    )}&am=${Number(rmaCollectionPayment.amount).toFixed(
                      2,
                    )}&cu=INR&tn=${encodeURIComponent(
                      `RMA order ${order.orderId}`,
                    )}`}
                    size={220}
                    level="M"
                    includeMargin
                  />
                </div>

                <p>
                  Show this QR code to the shop owner. The owner must pay RMA
                  the exact amount shown above. Do not confirm or collect the
                  payment yourself.
                </p>

                <p>
                  RMA UPI ID: <strong>{rmaCollectionPayment.upiId}</strong>
                </p>

                <p>
                  Collection will be enabled after RMA admin verifies the
                  payment.
                </p>
              </>
            ) : (
              <p>
                RMA payment details are not available yet. Refresh or try again
                later.
              </p>
            )}
          </section>
        )}

      {!isCollected &&
        order.deliveryAssignmentStatus === 'ACCEPTED' &&
        order.deliveryPickupStatus === 'PENDING' &&
        order.status === 'Ready' && (
          <section className="delivery_details_section delivery_pickup_section">
            <div className="delivery_pickup_content">
              <h3>Pickup</h3>

              <p>
                Go to the shop and collect the order before starting the
                customer delivery.
              </p>

              <button
                type="button"
                className="delivery_collect_button"
                onClick={handleCollectOrder}
                disabled={
                  collecting || rmaCollectionPayment?.status !== 'CONFIRMED'
                }
              >
                {collecting
                  ? 'Collecting...'
                  : rmaCollectionPayment?.status === 'CONFIRMED'
                    ? "I've Collected"
                    : 'Waiting for RMA Payment'}
              </button>
            </div>
          </section>
        )}

      {isCollected && order.status === 'OutForDelivery' && (
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
