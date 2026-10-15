import './Checkout.css';

import FlashMessage from '../../components/FlashMessage/FlashMessage';

import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useCart } from '../../context/CartContext';
import { useOrder } from '../../context/OrderContext';

import CheckoutEmpty from './components/CheckoutEmpty';
import CheckoutHeader from './components/CheckoutHeader';
import CheckoutShop from './components/CheckoutShop';
import DeliveryLocation from './components/DeliveryLocation';
import CustomerDetails from './components/CustomerDetails';
import OrderSummary from './components/OrderSummary';
import SecureNote from './components/SecureNote';
import LocationSheet from './components/LocationSheet';

import { fetchOrderById } from '../DeliveryStatus/utils/deliveryStatusApi';
import { QRCodeSVG } from 'qrcode.react';
import { load } from '@cashfreepayments/cashfree-js';

import {
  fetchSavedAddresses,
  fetchDeliveryPreview,
  createCashfreePayment,
} from './utils/checkoutApi';

import { calculatePayuPricing } from './utils/checkoutHelpers';

function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();

  const { cartItems, totalPrice } = useCart();

  const { createOrder } = useOrder();

  const orderType = 'delivery';
  const paymentMethod = 'ONLINE';

  const [deliveryLocation, setDeliveryLocation] = useState(null);

  const [showLocationSheet, setShowLocationSheet] = useState(false);

  const [savedAddresses, setSavedAddresses] = useState([]);

  const [loadingAddresses, setLoadingAddresses] = useState(false);

  const [showMapPicker, setShowMapPicker] = useState(false);

  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
    address: '',
  });

  const [loading, setLoading] = useState(false);
  const [directUpiOrder, setDirectUpiOrder] = useState(null);
  const [, setError] = useState('');
  const [flashMessage, setFlashMessage] = useState('');

  const [deliveryCharge, setDeliveryCharge] = useState(0);

  const [deliveryLoading, setDeliveryLoading] = useState(false);

  const [paymentFlowStatus, setPaymentFlowStatus] = useState('idle');
  const [paymentCheckError, setPaymentCheckError] = useState('');
  const [showPaymentOverlay, setShowPaymentOverlay] = useState(false);
  const paymentSuccessHandled = useRef(false);

  const [payuPricing, setPayuPricing] = useState({
    baseAmount: 0,
    payuFee: 0,
    payuGst: 0,
    payuCharges: 0,
    customerPayableAmount: 0,
  });

  const qrRef = useRef(null);

  const handleSaveUpiQr = () => {
    const svg = qrRef.current?.querySelector('svg');

    if (!svg || !directUpiOrder) {
      setError('Unable to generate the payment QR. Please try again.');
      return;
    }

    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], {
      type: 'image/svg+xml;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 660;
      canvas.height = 660;

      const context = canvas.getContext('2d');
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 20, 20, 620, 620);

      URL.revokeObjectURL(url);

      canvas.toBlob((pngBlob) => {
        if (!pngBlob) {
          setError('Unable to save the payment QR.');
          return;
        }

        const downloadUrl = URL.createObjectURL(pngBlob);
        const link = document.createElement('a');

        link.href = downloadUrl;
        link.download = `RMA-Payment-${directUpiOrder.orderId}.png`;
        document.body.appendChild(link);
        link.click();
        link.remove();

        setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
        setFlashMessage(
          'QR saved. Open PhonePe and upload it from your gallery.',
        );
      }, 'image/png');
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      setError('Unable to prepare the payment QR. Please try again.');
    };

    image.src = url;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setCustomer((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const loadSavedAddresses = async () => {
    try {
      setLoadingAddresses(true);

      const addresses = await fetchSavedAddresses();

      setSavedAddresses(addresses);
    } catch (error) {
      console.error('Fetch saved addresses error:', error);

      setSavedAddresses([]);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleSavedAddressSelect = (savedAddress) => {
    if (
      !Number.isFinite(Number(savedAddress.latitude)) ||
      !Number.isFinite(Number(savedAddress.longitude))
    ) {
      setError('This saved address does not have a valid location.');

      return;
    }

    setDeliveryLocation({
      latitude: Number(savedAddress.latitude),
      longitude: Number(savedAddress.longitude),
      address: savedAddress.address,
    });

    setCustomer((current) => ({
      ...current,
      address: savedAddress.address,
    }));

    setShowLocationSheet(false);
    setError('');
  };

  useEffect(() => {
    if (orderType !== 'delivery' || !deliveryLocation) {
      setDeliveryCharge(0);
      setDeliveryLoading(false);

      return;
    }

    const calculateDeliveryCharge = async () => {
      try {
        setDeliveryLoading(true);
        setError('');

        const ownerId = cartItems[0]?.ownerId;

        if (!ownerId) {
          throw new Error('Shop information is missing.');
        }

        const data = await fetchDeliveryPreview(ownerId, deliveryLocation);

        setDeliveryCharge(data.deliveryCharge);
      } catch (error) {
        console.error('Delivery charge calculation failed:', error);

        setDeliveryCharge(0);

        if (
          error.message?.toLowerCase().includes('within 5 km') ||
          error.message?.toLowerCase().includes('5 km')
        ) {
          setFlashMessage(
            'Delivery is available only within 5 km of this shop.',
          );
        } else {
          setError(error.message || 'Unable to calculate delivery charge');
        }
      } finally {
        setDeliveryLoading(false);
      }
    };

    calculateDeliveryCharge();
  }, [deliveryLocation, orderType, cartItems]);

  useEffect(() => {
    const pricing = calculatePayuPricing(totalPrice, deliveryCharge);

    setPayuPricing(pricing);
  }, [totalPrice, deliveryCharge]);

  useEffect(() => {
    if (!location.state?.openLocationSheet) {
      return;
    }

    const newlySavedAddress = location.state?.newlySavedAddress;

    if (newlySavedAddress) {
      const latitude = Number(newlySavedAddress.latitude);

      const longitude = Number(newlySavedAddress.longitude);

      setCustomer((current) => ({
        ...current,
        address: newlySavedAddress.address || '',
      }));

      if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
        setDeliveryLocation({
          latitude,
          longitude,
          address: newlySavedAddress.address || '',
        });
      }
    }

    setShowLocationSheet(true);

    loadSavedAddresses();

    navigate('/checkout', {
      replace: true,
      state: {},
    });
  }, [location.state, navigate]);

  const checkDirectUpiPayment = async () => {
    if (!directUpiOrder || paymentSuccessHandled.current) {
      return;
    }

    try {
      setPaymentCheckError('');

      const data = await fetchOrderById(directUpiOrder.orderId);
      const latestOrder = data?.order;

      if (!latestOrder) {
        throw new Error('Order details were not returned by the server.');
      }

      if (latestOrder.paymentStatus === 'Paid') {
        paymentSuccessHandled.current = true;
        setPaymentFlowStatus('success');
        return;
      }

      if (['Failed', 'Refunded'].includes(latestOrder.paymentStatus)) {
        setPaymentCheckError(
          latestOrder.paymentStatus === 'Refunded'
            ? 'This payment has been refunded.'
            : 'The order payment has failed. Please contact the shop.',
        );
        return;
      }

      setPaymentFlowStatus('waiting');
    } catch (error) {
      console.error('Direct UPI payment status check failed:', error);
      setPaymentCheckError(
        'Unable to check payment status. We will try again automatically.',
      );
      setPaymentFlowStatus('waiting');
    }
  };

  useEffect(() => {
    if (paymentFlowStatus !== 'waiting' || !directUpiOrder) {
      return undefined;
    }

    let cancelled = false;
    let timeoutId;

    const pollPaymentStatus = async () => {
      if (cancelled || paymentSuccessHandled.current) {
        return;
      }

      try {
        const data = await fetchOrderById(directUpiOrder.orderId);
        const latestOrder = data?.order;

        if (latestOrder?.paymentStatus === 'Paid') {
          if (!cancelled) {
            paymentSuccessHandled.current = true;
            setPaymentCheckError('');
            setPaymentFlowStatus('success');
          }
          return;
        }

        if (['Failed', 'Refunded'].includes(latestOrder?.paymentStatus)) {
          if (!cancelled) {
            setPaymentCheckError(
              latestOrder.paymentStatus === 'Refunded'
                ? 'This payment has been refunded.'
                : 'The order payment has failed. Please contact the shop.',
            );
            setPaymentFlowStatus('idle');
          }
          return;
        }
      } catch (error) {
        console.error('Payment polling failed:', error);

        if (!cancelled) {
          setPaymentCheckError(
            'Unable to check payment status. We will retry shortly.',
          );
        }
      }

      if (!cancelled && !paymentSuccessHandled.current) {
        timeoutId = setTimeout(pollPaymentStatus, 3000);
      }
    };

    // Check immediately, then repeat every three seconds if still pending.
    pollPaymentStatus();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [paymentFlowStatus, directUpiOrder]);

  useEffect(() => {
    if (paymentFlowStatus !== 'success' || !directUpiOrder) {
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      navigate(`/delivery-status/${directUpiOrder.orderId}`, {
        replace: true,
      });
    }, 6000);

    return () => clearTimeout(timeoutId);
  }, [paymentFlowStatus, directUpiOrder, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError('');

      const ownerId = cartItems[0].ownerId;

      const items = cartItems.map((item) => ({
        productId: item.product.productId,
        productName: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        unit: item.product.unit,
      }));

      if (!deliveryLocation) {
        setError('Please select your delivery location on the map.');

        setLoading(false);

        return;
      }

      const orderData = {
        ownerId,
        customer,
        orderType,
        items,
        paymentMethod,
        deliveryLocation,
      };

      console.log('Creating RMA order:', orderData);

      // ==========================================
      // STEP 1: CREATE RMA ORDER
      // ==========================================

      const order = await createOrder(orderData);

      console.log('RMA ORDER CREATED:', order);

      console.log('DIRECT UPI DEBUG:', {
        paymentProvider: order?.paymentProvider,
        shopUpiId: order?.shopUpiId,
        shopBankName: order?.shopBankName,
        shopUpiMobileNumber: order?.shopUpiMobileNumber,
        shopBankHolderName: order?.shopBankHolderName,
      });

      if (!order?.orderId) {
        throw new Error('Order was created but no order ID was returned.');
      }

      // Direct UPI orders do not use Cashfree.
      if (order.paymentProvider === 'DIRECT_UPI') {
        if (!order.shopUpiId) {
          throw new Error(
            'The shop has not configured a UPI ID for QR payments.',
          );
        }

        const payableAmount = Number(
          order.customerPayableAmount ?? order.totalPrice,
        );

        if (!Number.isFinite(payableAmount) || payableAmount <= 0) {
          throw new Error('Invalid order payment amount.');
        }

        setDirectUpiOrder({
          orderId: order.orderId,
          shopUpiId: order.shopUpiId,
          shopBankName: order.shopBankName || '',
          shopUpiMobileNumber: order.shopUpiMobileNumber || '',
          shopBankHolderName: order.shopBankHolderName || '',
          amount: payableAmount,
        });

        setLoading(false);
        return;
      }

      console.log('Backend calculated order:', {
        orderId: order.orderId,
        subtotal: order.subtotal,
        deliveryCharge: order.deliveryCharge,
        rmaFee: order.rmaFee,
        totalPrice: order.totalPrice,
      });

      // ==========================================
      // STEP 2: CREATE CASHFREE PAYMENT SESSION
      // ==========================================

      console.log('Creating Cashfree payment session...');

      const cashfreeData = await createCashfreePayment(order.orderId);

      console.log('Cashfree response:', cashfreeData);

      const paymentSessionId = cashfreeData.payment?.paymentSessionId;

      if (!paymentSessionId) {
        throw new Error('Cashfree payment session is missing.');
      }

      const environment =
        cashfreeData.payment.environment === 'production'
          ? 'production'
          : 'sandbox';

      // ==========================================
      // STEP 3: OPEN CASHFREE CHECKOUT
      // ==========================================

      const cashfree = await load({ mode: environment });

      if (!cashfree) {
        throw new Error('Unable to load Cashfree Checkout.');
      }

      console.log('Opening Cashfree Checkout...');

      const checkoutResult = await cashfree.checkout({
        paymentSessionId,
        redirectTarget: '_self',
      });

      // A returned error means checkout could not proceed.
      // Never mark the order as paid from this frontend result.
      if (checkoutResult?.error) {
        throw new Error(
          checkoutResult.error.message || 'Unable to open Cashfree Checkout.',
        );
      }

      // Cashfree normally redirects the customer to the return URL.
      // Payment confirmation must come from the backend/webhook.
    } catch (error) {
      console.error('Payment process failed:', error);

      if (
        error.message?.toLowerCase().includes('within 5 km') ||
        error.message?.toLowerCase().includes('5 km')
      ) {
        setFlashMessage('Delivery is available only within 5 km of this shop.');
      } else {
        setError(
          error.message ||
            'Something went wrong while processing your payment.',
        );
      }

      setLoading(false);
    }
  };

  if (
    directUpiOrder &&
    (paymentFlowStatus === 'success' ||
      (showPaymentOverlay && paymentFlowStatus === 'waiting'))
  ) {
    return (
      <DirectUpiPaymentOverlay
        status={paymentFlowStatus}
        amount={directUpiOrder.amount}
        orderId={directUpiOrder.orderId}
        error={paymentCheckError}
        onBack={() => setShowPaymentOverlay(false)}
      />
    );
  }

  if (cartItems.length === 0) {
    return <CheckoutEmpty onExploreShops={() => navigate('/find-shop')} />;
  }

  const shop = cartItems[0];

  const directUpiPayload = directUpiOrder
    ? `upi://pay?${new URLSearchParams({
        pa: directUpiOrder.shopUpiId.trim(),
        pn: shop.shopName || 'RMA Shop',
        am: Number(directUpiOrder.amount).toFixed(2),
        cu: 'INR',
        tr: String(directUpiOrder.orderId).slice(0, 35),
        tn: `RMA Order ${directUpiOrder.orderId}`,
      }).toString()}`
    : '';

  console.log('RMA UPI payload:', directUpiPayload);

  return (
    <main className="checkout">
      <FlashMessage
        message={flashMessage}
        onClose={() => setFlashMessage('')}
      />

      <CheckoutHeader />

      {directUpiOrder && (
        <section className="direct-upi-payment">
          <div className="direct-upi-qr">
            <div className="direct-upi-header">
              <span className="direct-upi-brand">RMA</span>
              <span className="direct-upi-secure">
                <icon name="shield-check" size="15px" />
                Direct UPI Payment
              </span>
            </div>

            <h3>Complete your payment</h3>
            <p className="direct-upi-subtitle">
              Scan the QR using PhonePe to pay the shop directly.
            </p>

            <div className="direct-upi-order-summary">
              <span>Order ID</span>
              <strong>{directUpiOrder.orderId}</strong>
              <div className="direct-upi-amount">
                <span>Amount to pay</span>
                <strong>₹{directUpiOrder.amount.toFixed(2)}</strong>
              </div>
            </div>

            <div className="direct-upi-shop-details">
              <h4>
                <icon name="store" size="18px" />
                Shop payment details
              </h4>

              {directUpiOrder.shopBankHolderName && (
                <div className="direct-upi-detail-row">
                  <span>Account holder</span>
                  <strong>{directUpiOrder.shopBankHolderName}</strong>
                </div>
              )}

              {directUpiOrder.shopBankName && (
                <div className="direct-upi-detail-row">
                  <span>Bank name</span>
                  <strong>{directUpiOrder.shopBankName}</strong>
                </div>
              )}

              {directUpiOrder.shopUpiMobileNumber && (
                <div className="direct-upi-copy-row">
                  <div className="direct-upi-copy-info">
                    <span>UPI-linked mobile</span>
                    <strong>{directUpiOrder.shopUpiMobileNumber}</strong>
                  </div>

                  <button
                    type="button"
                    className="direct-upi-copy-button"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(
                          directUpiOrder.shopUpiMobileNumber,
                        );
                        setFlashMessage('UPI mobile number copied!');
                      } catch {
                        setFlashMessage(
                          'Unable to copy the number. Please copy it manually.',
                        );
                      }
                    }}
                    aria-label="Copy UPI-linked mobile number"
                    title="Copy mobile number"
                  >
                    <icon name="copy" size="17px" />
                    <span>Copy</span>
                  </button>
                </div>
              )}

              <p className="direct-upi-verification-note">
                <icon name="info" size="16px" />
                Always verify the recipient and amount in PhonePe before paying.
              </p>
            </div>

            <div className="direct-upi-qr-panel">
              <div className="direct-upi-qr-image" ref={qrRef}>
                <QRCodeSVG
                  value={directUpiPayload}
                  size={240}
                  level="M"
                  includeMargin
                  bgColor="#ffffff"
                  fgColor="#000000"
                />
              </div>
              <strong>Scan to pay</strong>
              <span>Use PhonePe's Scan QR option</span>
            </div>

            <button
              type="button"
              className="place_order_button"
              onClick={handleSaveUpiQr}
            >
              <icon name="download" size="18px" />
              Save QR & Pay with PhonePe
            </button>

            <div className="direct-upi-instructions">
              <h4>How to pay</h4>
              <ol>
                <li>Save the payment QR to your phone.</li>
                <li>Open PhonePe and select Scan QR.</li>
                <li>Choose the gallery or upload-image option.</li>
                <li>Select the saved RMA QR code.</li>
                <li>Verify the recipient and amount, then complete payment.</li>
              </ol>
            </div>

            <p className="direct-upi-warning">
              If the recipient or amount is different, cancel the payment.
            </p>
          </div>

          <div className="direct-upi-pending">
            <icon name="clock-3" size="20px" />

            <div>
              <strong>Waiting for shop confirmation</strong>
              <p>
                After completing your payment, tap the button below. RMA will
                automatically check for confirmation from the shop.
              </p>
            </div>
          </div>

          {paymentCheckError && paymentFlowStatus === 'idle' && (
            <p className="upi-poll-error" role="alert">
              {paymentCheckError}
            </p>
          )}

          <button
            type="button"
            className="place_order_button direct-upi-status-button"
            onClick={() => {
              setShowPaymentOverlay(true);
              checkDirectUpiPayment();
            }}
            disabled={
              paymentFlowStatus === 'waiting' || paymentFlowStatus === 'success'
            }
          >
            <icon name="check-circle" size="18px" />
            I've Paid — Check Status
          </button>

          <button
            type="button"
            className="direct-upi-secondary-button"
            onClick={() =>
              navigate(`/delivery-status/${directUpiOrder.orderId}`)
            }
          >
            View Order Status
            <icon name="arrow-right" size="18px" />
          </button>
        </section>
      )}

      <CheckoutShop shopName={shop.shopName} />

      {!directUpiOrder && (
        <div className="checkout_layout">
          <div className="checkout_main">
            {orderType === 'delivery' && (
              <DeliveryLocation
                deliveryLocation={deliveryLocation}
                onChooseLocation={() => {
                  setShowLocationSheet(true);
                  loadSavedAddresses();
                }}
              />
            )}

            <CustomerDetails
              customer={customer}
              onChange={handleChange}
              onSubmit={handleSubmit}
              orderType={orderType}
            />
          </div>

          <aside className="checkout_sidebar">
            <OrderSummary
              cartItems={cartItems}
              totalPrice={totalPrice}
              orderType={orderType}
              deliveryLoading={deliveryLoading}
              deliveryCharge={deliveryCharge}
              paymentMethod={paymentMethod}
              payuPricing={payuPricing}
            />

            <SecureNote />

            <button
              className="place_order_button"
              type="submit"
              form="checkout-form"
              disabled={loading}
            >
              <span>
                {loading
                  ? 'Placing Order...'
                  : paymentMethod === 'ONLINE'
                    ? 'Continue to Payment'
                    : 'Place Order'}
              </span>

              {!loading && <span className="place_order_arrow">→</span>}
            </button>
          </aside>
        </div>
      )}

      {showLocationSheet && (
        <LocationSheet
          showMapPicker={showMapPicker}
          loadingAddresses={loadingAddresses}
          savedAddresses={savedAddresses}
          onClose={() => {
            setShowMapPicker(false);
            setShowLocationSheet(false);
          }}
          onBack={() => setShowMapPicker(false)}
          onShowMap={() => setShowMapPicker(true)}
          onAddAddress={() => {
            navigate('/profile/saved-addresses/add', {
              state: {
                returnToLocationSheet: true,
                returnPath: '/checkout',
              },
            });
          }}
          onSavedAddressSelect={handleSavedAddressSelect}
          onLocationSelect={(selectedLocation) => {
            console.log('Confirmed map location:', selectedLocation);

            setDeliveryLocation(selectedLocation);

            setCustomer((current) => ({
              ...current,
              address: selectedLocation.address || '',
            }));

            setShowMapPicker(false);
            setShowLocationSheet(false);
          }}
        />
      )}
    </main>
  );
}

function DirectUpiPaymentOverlay({ status, amount, orderId, error, onBack }) {
  if (status === 'idle') {
    return null;
  }

  if (status === 'success') {
    return (
      <div
        className="upi-payment-overlay upi-payment-success"
        role="status"
        aria-live="polite"
      >
        <div className="upi-confetti" aria-hidden="true">
          {Array.from({ length: 36 }, (_, index) => (
            <span
              key={index}
              style={{
                '--confetti-index': index,
                '--confetti-delay': `${(index % 9) * 0.08}s`,
                '--confetti-left': `${(index * 37 + 11) % 100}%`,
              }}
            />
          ))}
        </div>

        <div className="upi-success-content">
          <div className="upi-success-check">
            <svg viewBox="0 0 64 64" aria-hidden="true">
              <circle cx="32" cy="32" r="29" />
              <path d="M18 33 L27 42 L46 22" />
            </svg>
          </div>

          <p className="upi-overlay-eyebrow">RMA PAYMENT</p>
          <h1>Payment Successful!</h1>
          <p className="upi-success-amount">₹{Number(amount).toFixed(2)}</p>
          <p className="upi-success-description">
            Your shop has confirmed your payment.
          </p>
          <p className="upi-success-order">Order ID: {orderId}</p>
          <div className="upi-redirect-message">
            Taking you to your order status…
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="upi-payment-overlay upi-payment-waiting"
      role="status"
      aria-live="polite"
    >
      <div className="upi-waiting-content">
        <div className="upi-waiting-spinner" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>

        <p className="upi-overlay-eyebrow">RMA PAYMENT</p>
        <h1>Awaiting shop confirmation</h1>
        <p>
          We’re checking whether the shop has received your UPI payment. Keep
          this page open while we verify the status.
        </p>

        <div className="upi-waiting-amount">₹{Number(amount).toFixed(2)}</div>

        <p className="upi-success-order">Order ID: {orderId}</p>

        <button
          type="button"
          className="upi-back-checkout-button"
          onClick={onBack}
        >
          ← Back to Checkout
        </button>

        {error && <p className="upi-poll-error">{error}</p>}

        <div className="upi-polling-indicator">
          <span />
          Checking payment status automatically
        </div>
      </div>
    </div>
  );
}

export default Checkout;
