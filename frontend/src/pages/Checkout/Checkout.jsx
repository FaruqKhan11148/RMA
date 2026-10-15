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
        tn: 'RMA Order',
      }).toString()}`
    : '';

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
            <h3>Pay using PhonePe</h3>

            <p>
              Order ID: <strong>{directUpiOrder.orderId}</strong>
            </p>

            <p>
              Pay exactly <strong>₹{directUpiOrder.amount.toFixed(2)}</strong>
            </p>

            <div className="direct-upi-shop-details">
              <h4>Shop Payment Details</h4>

              {directUpiOrder.shopBankName && (
                <p>
                  Bank: <strong>{directUpiOrder.shopBankName}</strong>
                </p>
              )}

              {directUpiOrder.shopUpiMobileNumber && (
                <div className="direct-upi-copy-row">
                  <div className="direct-upi-copy-info">
                    <span>UPI-linked mobile number</span>
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
                    <icon name="copy" size="18px" />
                    <span>Copy</span>
                  </button>
                </div>
              )}

              <p className="direct-upi-verification-note">
                Verify the shop's payment details before paying.
              </p>
            </div>

            <div ref={qrRef} className="direct-upi-qr-image">
              <QRCodeSVG
                value={directUpiPayload}
                size={280}
                level="M"
                includeMargin
                bgColor="#ffffff"
                fgColor="#000000"
              />
            </div>

            <button
              type="button"
              className="place_order_button"
              onClick={handleSaveUpiQr}
            >
              Save QR & Pay with PhonePe
            </button>

            <ol className="direct-upi-instructions">
              <li>Save the QR image to your phone.</li>
              <li>Open PhonePe and choose Scan QR.</li>
              <li>Choose the gallery or upload-image option.</li>
              <li>Select the saved RMA payment QR.</li>
              <li>Verify the shop name and exact amount before paying.</li>
            </ol>

            <p>
              If PhonePe displays a different recipient or amount, do not pay.
            </p>
          </div>

          <p>
            After payment, the shop must verify the transfer. Your order remains
            pending until the shop confirms it.
          </p>

          <button
            type="button"
            className="place_order_button"
            onClick={() =>
              navigate(`/delivery-status/${directUpiOrder.orderId}`)
            }
          >
            View Order Status
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

export default Checkout;
