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

import {
  fetchSavedAddresses,
  fetchDeliveryPreview,
  createPayuPayment,
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

        setError(error.message || 'Unable to calculate delivery charge');
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
      // STEP 2: CREATE PAYU PAYMENT
      // ==========================================

      console.log('Creating PayU payment...');

      const payuData = await createPayuPayment(order.orderId);

      console.log('PayU response:', payuData);

      if (!payuData.paymentUrl || !payuData.payment) {
        throw new Error('PayU payment details are missing.');
      }

      if (!payuData.pricing) {
        throw new Error('PayU pricing details are missing.');
      }

      console.log('Final backend pricing:', payuData.pricing);

      console.log('PayU payment created successfully.');

      console.log('PayU amount:', payuData.payment.amount);

      console.log('PayU transaction ID:', payuData.payment.txnid);

      // ==========================================
      // STEP 3: SEND CUSTOMER DIRECTLY TO PAYU
      // ==========================================

      const form = document.createElement('form');

      form.method = 'POST';
      form.action = payuData.paymentUrl;

      form.style.display = 'none';

      const paymentFields = {
        key: payuData.payment.key,
        txnid: payuData.payment.txnid,
        amount: payuData.payment.amount,
        productinfo: payuData.payment.productinfo,
        firstname: payuData.payment.firstname,
        email: payuData.payment.email,
        phone: payuData.payment.phone,
        surl: payuData.payment.surl,
        furl: payuData.payment.furl,
        hash: payuData.payment.hash,
      };

      Object.entries(paymentFields).forEach(([name, value]) => {
        const input = document.createElement('input');

        input.type = 'hidden';
        input.name = name;
        input.value = String(value ?? '');

        form.appendChild(input);
      });

      document.body.appendChild(form);

      form.submit();
    } catch (error) {
      console.error('Payment process failed:', error);

      setError(
        error.message || 'Something went wrong while processing your payment.',
      );

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
