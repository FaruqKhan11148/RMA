import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

import OrderLocationMap from '../../../../components/map/OrderLocationMap';

import {
  fetchDeliveryRoute,
  collectDeliveryOrder,
  fetchDeliveryChargePayment,
  acknowledgeRmaCollectionPayment,
} from '../utils/deliveryOrdersApi';

function formatMoney(value) {
  const amount = Number(value);
  return `₹${(Number.isFinite(amount) ? amount : 0).toFixed(2)}`;
}

function formatDistance(value) {
  const distance = Number(value);
  return Number.isFinite(distance) ? `${distance.toFixed(2)} km` : '—';
}

function formatDuration(value) {
  const minutes = Number(value);

  if (!Number.isFinite(minutes) || minutes < 0) return '—';
  if (minutes < 1) return 'Less than 1 min';

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);

  if (hours === 0) return `${Math.round(minutes)} min`;
  if (remainingMinutes === 0) return `${hours} hr`;

  return `${hours} hr ${remainingMinutes} min`;
}

function getItemName(item) {
  return item.productName || item.name || 'Product';
}

function getItemTotal(item) {
  const explicitTotal = Number(item.total);

  if (item.total != null && Number.isFinite(explicitTotal)) {
    return explicitTotal;
  }

  const price = Number(item.price) || 0;
  const quantity = Number(item.quantity) || 0;

  return price * quantity;
}

function getPhoneHref(phone) {
  return phone ? `tel:${String(phone).replace(/\s+/g, '')}` : undefined;
}

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
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const [rmaCollectionPayment, setRmaCollectionPayment] = useState(
    order.rmaCollectionPayment || null,
  );
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  const [acknowledgingPayment, setAcknowledgingPayment] = useState(false);
  const [paymentAcknowledgementMessage, setPaymentAcknowledgementMessage] =
    useState('');

  const isCollected = order.deliveryPickupStatus === 'COLLECTED';

  const owner =
    order.ownerId && typeof order.ownerId === 'object' ? order.ownerId : null;

  const shopName = owner?.shopName || 'Shop';
  const shopOwnerName = owner?.ownerName || '';
  const shopPhone = owner?.phone || '';
  const shopId = owner?.shopId || '';

  const destination = isCollected
    ? order.deliveryLocation
    : order.pickupLocation;

  const destinationTitle = isCollected
    ? 'Customer Delivery Address'
    : 'Shop Pickup Location';

  const routeTitle = isCollected ? 'Route to Customer' : 'Route to Shop';

  const hasDestinationCoordinates =
    destination?.latitude != null &&
    destination?.longitude != null &&
    Number.isFinite(Number(destination.latitude)) &&
    Number.isFinite(Number(destination.longitude));

  const routeDistance = route?.distance?.kilometers;
  const routeDuration = route?.duration?.minutes;

  const recordedDeliveryDistance = Number(order.deliveryDistance);

  const deliveryDistance =
    order.deliveryDistance != null && Number.isFinite(recordedDeliveryDistance)
      ? recordedDeliveryDistance
      : null;

  const items = Array.isArray(order.items) ? order.items : [];

  const subtotal = Number(order.subtotal);
  const deliveryCharge = Number(order.deliveryCharge);
  const riderEarnings = Number(order.deliveryRiderAmount);

  const hasSubtotal = order.subtotal != null && Number.isFinite(subtotal);
  const hasDeliveryCharge =
    order.deliveryCharge != null && Number.isFinite(deliveryCharge);
  const hasRiderEarnings =
    order.deliveryRiderAmount != null && Number.isFinite(riderEarnings);

  const customerTotal = Number(
    order.customerPayableAmount ?? order.totalPrice ?? 0,
  );

  const hasValidCustomerTotal = Number.isFinite(customerTotal);

  useEffect(() => {
    let cancelled = false;
    let intervalId;
    let requestInProgress = false;

    const loadRoute = async (showLoader = false) => {
      if (requestInProgress) return;

      if (
        destination?.latitude == null ||
        destination?.longitude == null ||
        !Number.isFinite(Number(destination.latitude)) ||
        !Number.isFinite(Number(destination.longitude))
      ) {
        setRouteLoading(false);
        setRoute(null);
        setRouteError(
          isCollected
            ? 'Customer delivery location is not available for this order.'
            : 'Shop pickup location is not available for this order.',
        );
        return;
      }

      requestInProgress = true;

      try {
        if (showLoader && !cancelled) {
          setRouteLoading(true);
        }

        setRouteError('');

        const token = localStorage.getItem('delivery_token');
        const data = await fetchDeliveryRoute(token, order.orderId);

        if (!cancelled && data.route) {
          setRoute(data.route);
        }
      } catch (error) {
        console.error('Failed to fetch delivery route:', error);

        if (!cancelled) {
          setRouteError(error.message || 'Unable to refresh delivery route.');
        }
      } finally {
        requestInProgress = false;

        if (!cancelled && showLoader) {
          setRouteLoading(false);
        }
      }
    };

    loadRoute(true);

    intervalId = setInterval(() => {
      loadRoute(false);
    }, 15000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
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

  const handleAcknowledgeRmaPayment = async () => {
    if (
      acknowledgingPayment ||
      rmaCollectionPayment?.status !== 'OWNER_MARKED_PAID'
    ) {
      return;
    }

    const confirmed = window.confirm(
      `Have you reviewed the owner's payment evidence for order ${order.orderId} and are you ready to acknowledge it for RMA admin review? This does not confirm that RMA received the money.`,
    );

    if (!confirmed) return;

    try {
      setAcknowledgingPayment(true);
      setPaymentError('');
      setPaymentAcknowledgementMessage('');

      const token = localStorage.getItem('delivery_token');

      const data = await acknowledgeRmaCollectionPayment(token, order.orderId);

      setRmaCollectionPayment(
        data.payment ||
          data.rmaCollectionPayment ||
          data.order?.rmaCollectionPayment ||
          null,
      );

      setPaymentAcknowledgementMessage(
        data.message ||
          'Acknowledgement submitted. RMA admin must verify the actual transaction.',
      );
    } catch (error) {
      setPaymentError(error.message || 'Unable to acknowledge the payment.');
    } finally {
      setAcknowledgingPayment(false);
    }
  };

  const handleCollectOrder = async () => {
    if (collecting) return;

    if (order.deliveryAssignmentStatus !== 'ACCEPTED') {
      alert('Accept this delivery assignment before collecting the order.');
      return;
    }

    if (order.status !== 'Ready' || isCollected) {
      alert('This order is not currently ready for collection.');
      return;
    }

    if (
      order.deliveryAssignmentType === 'RMA' &&
      rmaCollectionPayment?.status !== 'CONFIRMED'
    ) {
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

  const handleSubmitOtp = async () => {
    const enteredOtp = otp.trim();

    if (!/^\d{6}$/.test(enteredOtp)) {
      alert('Please enter the valid 6-digit delivery OTP.');
      return;
    }

    if (verifyingOtp) return;

    if (typeof onVerifyOtp !== 'function') {
      alert('OTP verification is currently unavailable. Please try again.');
      return;
    }

    try {
      setVerifyingOtp(true);
      await onVerifyOtp(order.orderId, enteredOtp);
    } finally {
      setVerifyingOtp(false);
    }
  };

  const openMapDirections = () => {
    if (!hasDestinationCoordinates) return;

    const latitude = Number(destination.latitude);
    const longitude = Number(destination.longitude);

    const url = isCollected
      ? `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`
      : `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`;

    window.open(url, '_blank', 'noopener,noreferrer');
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
        <h3>Shop Details</h3>

        <div className="delivery_customer_details">
          <div>
            <span>Shop Name</span>
            <strong>{shopName}</strong>
          </div>

          {shopOwnerName && (
            <div>
              <span>Shop Owner</span>
              <strong>{shopOwnerName}</strong>
            </div>
          )}

          {shopId && (
            <div>
              <span>Shop ID</span>
              <strong>{shopId}</strong>
            </div>
          )}

          <div>
            <span>Shop Phone</span>

            {shopPhone ? (
              <a href={getPhoneHref(shopPhone)}>{shopPhone}</a>
            ) : (
              <span>Not available</span>
            )}
          </div>
        </div>

        {owner?.location?.address && (
          <p className="delivery_address">{owner.location.address}</p>
        )}
      </section>

      <section className="delivery_details_section">
        <h3>Customer Details</h3>

        <div className="delivery_customer_details">
          <div>
            <span>Name</span>
            <strong>{order.customer?.name || 'Customer'}</strong>
          </div>

          <div>
            <span>Phone</span>

            {order.customer?.phone ? (
              <a href={getPhoneHref(order.customer.phone)}>
                {order.customer.phone}
              </a>
            ) : (
              <span>Not available</span>
            )}
          </div>
        </div>
      </section>

      <section className="delivery_details_section">
        <h3>{destinationTitle}</h3>

        <p className="delivery_address">
          {destination?.address || 'Address not available'}
        </p>

        {hasDestinationCoordinates && (
          <button
            type="button"
            className="delivery_directions_button"
            onClick={openMapDirections}
          >
            Navigate with Google Maps
          </button>
        )}
      </section>

      <section className="delivery_details_section">
        <h3>{routeTitle}</h3>

        {!hasDestinationCoordinates ? (
          <div className="delivery_route_error">
            {isCollected
              ? 'Customer delivery location is not available for this order.'
              : 'Shop pickup location is not available for this order.'}
          </div>
        ) : routeLoading ? (
          <div className="delivery_route_message">Loading route...</div>
        ) : routeError && !route ? (
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
                  event.preventDefault();
                  setIsMapFullscreen(true);
                }
              }}
            >
              <OrderLocationMap
                latitude={Number(destination.latitude)}
                longitude={Number(destination.longitude)}
                route={route}
                currentLocation={currentLocation}
              />

              <div className="delivery_map_expand_hint">
                <span>Open full map</span>
              </div>
            </div>

            <div className="delivery_route_summary">
              <div>
                <span>Route Distance</span>
                <strong>{formatDistance(routeDistance)}</strong>
              </div>

              <div>
                <span>Estimated Travel Time</span>
                <strong>{formatDuration(routeDuration)}</strong>
              </div>
            </div>

            {routeError && (
              <p className="delivery_route_error" role="status">
                Could not refresh the route: {routeError}
              </p>
            )}

            {isCollected && deliveryDistance != null && (
              <div className="delivery_distance">
                Recorded Delivery Distance: {formatDistance(deliveryDistance)}
              </div>
            )}
          </>
        )}
      </section>

      {isMapFullscreen && hasDestinationCoordinates && (
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
            latitude={Number(destination.latitude)}
            longitude={Number(destination.longitude)}
            route={route}
            currentLocation={currentLocation}
            fullscreen
          />

          <div className="delivery_fullscreen_map_info">
            <strong>{routeTitle}</strong>
            <span>{formatDistance(routeDistance)}</span>
            <span>{formatDuration(routeDuration)}</span>
          </div>

          <button
            type="button"
            className="delivery_directions_button"
            onClick={openMapDirections}
          >
            Navigate with Google Maps
          </button>
        </div>
      )}

      <section className="delivery_details_section">
        <h3>Order Items ({items.length})</h3>

        {items.length === 0 ? (
          <p>No item details are available for this order.</p>
        ) : (
          <div className="delivery_order_items">
            {items.map((item, index) => (
              <div
                className="delivery_order_item"
                key={`${item.productId || item.catalogueProductId || getItemName(item)}-${index}`}
              >
                <div>
                  <strong>{getItemName(item)}</strong>

                  <span>
                    Qty: {Number(item.quantity) || 0}
                    {item.unit ? ` ${item.unit}` : ''}
                  </span>

                  {item.price != null && (
                    <span>Unit Price: {formatMoney(item.price)}</span>
                  )}
                </div>

                <strong>{formatMoney(getItemTotal(item))}</strong>
              </div>
            ))}
          </div>
        )}

        <div className="delivery_details_total">
          <span>Item Subtotal</span>
          <strong>
            {hasSubtotal
              ? formatMoney(subtotal)
              : formatMoney(
                  items.reduce((sum, item) => sum + getItemTotal(item), 0),
                )}
          </strong>
        </div>

        {hasDeliveryCharge && (
          <div className="delivery_details_total">
            <span>Delivery Charge</span>
            <strong>{formatMoney(deliveryCharge)}</strong>
          </div>
        )}

        {hasValidCustomerTotal && (
          <div className="delivery_details_total">
            <span>Customer Total</span>
            <strong>{formatMoney(customerTotal)}</strong>
          </div>
        )}
      </section>

      <section className="delivery_details_section">
        <h3>Delivery Earnings</h3>

        <div className="delivery_customer_details">
          <div>
            <span>Delivery Partner Earnings</span>
            <strong>
              {hasRiderEarnings ? formatMoney(riderEarnings) : 'Not available'}
            </strong>
          </div>

          {hasDeliveryCharge && (
            <div>
              <span>Customer Delivery Charge</span>
              <strong>{formatMoney(deliveryCharge)}</strong>
            </div>
          )}
        </div>

        <p className="delivery_route_message">
          Earnings shown here are the amounts recorded on this order. They may
          differ from the customer delivery charge.
        </p>
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
              <strong>{formatMoney(rmaCollectionPayment?.amount ?? 0)}</strong>
            </p>

            {paymentLoading ? (
              <p>Loading RMA payment details...</p>
            ) : (
              <>
                {paymentError && (
                  <p className="delivery_payment_error" role="alert">
                    {paymentError}
                  </p>
                )}

                {paymentAcknowledgementMessage && (
                  <p role="status">{paymentAcknowledgementMessage}</p>
                )}

                {rmaCollectionPayment?.status === 'CONFIRMED' ? (
                  <p className="delivery_payment_confirmed">
                    RMA admin has confirmed payment. You can collect the order.
                  </p>
                ) : rmaCollectionPayment?.status === 'OWNER_MARKED_PAID' ? (
                  <>
                    <p>
                      The owner has marked this payment as sent. Review the
                      owner's payment evidence before acknowledging it. Your
                      acknowledgement is not proof that RMA received the money.
                    </p>

                    <button
                      type="button"
                      onClick={handleAcknowledgeRmaPayment}
                      disabled={acknowledgingPayment}
                    >
                      {acknowledgingPayment
                        ? 'Submitting acknowledgement...'
                        : "I've Reviewed the Payment Evidence"}
                    </button>
                  </>
                ) : rmaCollectionPayment?.status === 'BOTH_MARKED_PAID' ? (
                  <p>
                    You and the owner have acknowledged the payment. Waiting for
                    RMA admin to verify the actual incoming transaction. Do not
                    collect the order yet.
                  </p>
                ) : rmaCollectionPayment?.status === 'DISPUTED' ? (
                  <p className="delivery_payment_error" role="alert">
                    This payment is under review by RMA. Contact the
                    administrator before collecting the order.
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

                    <div className="rma_collection_instructions">
                      <p className="rma_collection_intro">
                        Show this QR code to the shop owner and ask them to pay
                        the exact amount shown above.
                      </p>

                      <div className="rma_collection_warning">
                        <strong>Important</strong>
                        <p>Do not confirm or collect the payment yourself.</p>
                      </div>

                      <div className="rma_collection_upi">
                        <span>RMA UPI ID</span>
                        <strong>{rmaCollectionPayment.upiId}</strong>
                      </div>

                      <p className="rma_collection_note">
                        Collection will be enabled after RMA admin verifies the
                        payment.
                      </p>
                    </div>
                  </>
                ) : (
                  <p>
                    RMA payment details are not available yet. Refresh or try
                    again later.
                  </p>
                )}
              </>
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
                  collecting ||
                  (order.deliveryAssignmentType === 'RMA' &&
                    rmaCollectionPayment?.status !== 'CONFIRMED')
                }
              >
                {collecting
                  ? 'Collecting...'
                  : order.deliveryAssignmentType !== 'RMA' ||
                      rmaCollectionPayment?.status === 'CONFIRMED'
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
              inputMode="numeric"
              autoComplete="one-time-code"
              value={otp}
              onChange={(event) =>
                setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))
              }
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              aria-label="Customer delivery OTP"
            />

            <button
              type="button"
              onClick={handleSubmitOtp}
              disabled={verifyingOtp || !/^\d{6}$/.test(otp.trim())}
            >
              {verifyingOtp ? 'Verifying...' : 'Verify & Deliver'}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

export default DeliveryOrderDetails;
