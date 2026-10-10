import './Checkout.css';

import FlashMessage from '../../components/FlashMessage/FlashMessage';

import { useEffect, useState } from 'react';
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

  return (
    <main className="checkout">
      <FlashMessage
        message={flashMessage}
        onClose={() => setFlashMessage('')}
      />

      <CheckoutHeader />

      <CheckoutShop shopName={shop.shopName} />

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
