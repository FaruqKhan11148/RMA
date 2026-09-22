import './Checkout.css';

import FlashMessage from '../../components/FlashMessage/FlashMessage';

import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useCart } from '../../context/CartContext';
import { useOrder } from '../../context/OrderContext';
import MapPicker from '../../components/map/MapPicker';

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

  const fetchSavedAddresses = async () => {
    try {
      setLoadingAddresses(true);

      const response = await fetch(
        'https://rma-backend-bo4a.onrender.com/api/customers/addresses',
        {
          credentials: 'include',
        },
      );

      if (response.status === 401) {
        setSavedAddresses([]);
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch saved addresses');
      }

      setSavedAddresses(data.addresses || []);
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

        const response = await fetch(
          'https://rma-backend-bo4a.onrender.com/api/orders/delivery-preview',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ownerId,
              deliveryLocation: {
                latitude: Number(deliveryLocation.latitude),
                longitude: Number(deliveryLocation.longitude),
              },
            }),
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || 'Unable to calculate delivery charge',
          );
        }

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
    const baseAmount = Number(totalPrice) + Number(deliveryCharge);

    const payuFee = Number((baseAmount * 0.02).toFixed(2));

    const payuGst = Number((payuFee * 0.18).toFixed(2));

    const payuCharges = Number((payuFee + payuGst).toFixed(2));

    const customerPayableAmount = Number((baseAmount + payuCharges).toFixed(2));

    setPayuPricing({
      baseAmount,
      payuFee,
      payuGst,
      payuCharges,
      customerPayableAmount,
    });
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
    fetchSavedAddresses();

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

      const payuResponse = await fetch(
        'https://rma-backend-bo4a.onrender.com/api/payments/create-order',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId: order.orderId,
          }),
        },
      );

      const payuData = await payuResponse.json();

      console.log('PayU response:', payuData);

      if (!payuResponse.ok) {
        throw new Error(payuData.message || 'Unable to create PayU payment.');
      }

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
    return (
      <main className="checkout_empty">
        <div className="checkout_empty_icon">🛒</div>

        <h1>Your cart is empty</h1>

        <p>Add some products to your cart before continuing to checkout.</p>

        <button type="button" onClick={() => navigate('/find-shop')}>
          Explore Shops
          <span>→</span>
        </button>
      </main>
    );
  }

  const shop = cartItems[0];

  return (
    <main className="checkout">
      <FlashMessage
        message={flashMessage}
        onClose={() => setFlashMessage('')}
      />
      {/* ========================================
          HEADER
      ======================================== */}

      <section className="checkout_header">
        <div className="checkout_header_content">
          <span className="checkout_eyebrow">FINAL STEP</span>

          <h1>Checkout</h1>

          <p>
            Review your order and complete your details to place your order.
          </p>
        </div>
      </section>

      {/* ========================================
          SHOP
      ======================================== */}

      <section className="checkout_shop_card">
        <div className="checkout_shop_icon">R</div>

        <div className="checkout_shop_info">
          <span>ORDERING FROM</span>

          <h2>{shop.shopName}</h2>
        </div>
      </section>

      {/* ========================================
          MAIN CHECKOUT CONTENT
      ======================================== */}

      <div className="checkout_layout">
        <div className="checkout_main">
          {/* ======================================
              DELIVERY LOCATION
          ====================================== */}

          {orderType === 'delivery' && (
            <section className="checkout_card checkout_location_card">
              <div className="checkout_card_header">
                <div>
                  <span className="checkout_step">01</span>

                  <div>
                    <h2>Delivery Location</h2>

                    <p>Select exactly where you want your order delivered.</p>
                  </div>
                </div>
              </div>

              <div className="checkout_choose_location">
                <button
                  type="button"
                  className="checkout_choose_location_button"
                  onClick={() => {
                    setShowLocationSheet(true);
                    fetchSavedAddresses();
                  }}
                >
                  <div className="checkout_choose_location_icon">
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 21C12 21 19 14.5 19 9C19 5.134 15.866 2 12 2C8.134 2 5 5 5 9C5 14.5 12 21 12 21Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      <circle
                        cx="12"
                        cy="9"
                        r="2.5"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>

                  <div className="checkout_choose_location_content">
                    <strong>
                      {deliveryLocation?.address
                        ? 'Delivery address selected'
                        : 'Choose delivery address'}
                    </strong>

                    <span>
                      {deliveryLocation?.address
                        ? deliveryLocation.address
                        : 'Select a saved address or add a new one'}
                    </span>
                  </div>

                  <span className="checkout_choose_location_arrow">›</span>
                </button>
              </div>

              {deliveryLocation && (
                <div className="location_selected">
                  <span className="location_selected_icon">✓</span>

                  <div>
                    <strong>Delivery location selected</strong>

                    <span>
                      {deliveryLocation.address ||
                        'Your current location is selected for delivery.'}
                    </span>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* ======================================
              CUSTOMER DETAILS
          ====================================== */}

          <section className="checkout_card checkout_customer_card">
            <div className="checkout_card_header">
              <div>
                <span className="checkout_step">02</span>

                <div>
                  <h2>Your Details</h2>

                  <p>Enter your contact information.</p>
                </div>
              </div>
            </div>

            <form
              id="checkout-form"
              className="checkout_form"
              onSubmit={handleSubmit}
            >
              <div className="checkout_form_group">
                <label htmlFor="checkout-name">Full Name</label>

                <input
                  id="checkout-name"
                  type="text"
                  name="name"
                  placeholder="Enter your name"
                  value={customer.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="checkout_form_group">
                <label htmlFor="checkout-phone">Mobile Number</label>

                <input
                  id="checkout-phone"
                  type="tel"
                  name="phone"
                  placeholder="Enter your mobile number"
                  value={customer.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              {orderType === 'delivery' && (
                <div className="checkout_form_group">
                  <label htmlFor="checkout-address">
                    Detailed Delivery Address
                  </label>
                  <textarea
                    id="checkout-address"
                    name="address"
                    placeholder="Enter your complete delivery address"
                    value={customer.address}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}
            </form>
          </section>
        </div>

        {/* ========================================
            ORDER SUMMARY
        ======================================== */}

        <aside className="checkout_sidebar">
          <section className="checkout_summary_card">
            <div className="checkout_summary_header">
              <div>
                <h2>Order Summary</h2>
              </div>
            </div>
            <div className="checkout_summary_items">
              {cartItems.map((item) => (
                <div className="summary_item" key={item.product.productId}>
                  <div className="summary_item_info">
                    <strong>{item.product.name}</strong>

                    <span>
                      {item.quantity} × ₹{item.product.price}
                    </span>
                  </div>

                  <strong className="summary_item_price">
                    ₹{item.product.price * item.quantity}
                  </strong>
                </div>
              ))}
            </div>

            <div className="checkout_summary_divider" />

            {/* ITEM TOTAL */}

            <div className="summary_row">
              <span>Item Total</span>

              <strong>₹{totalPrice}</strong>
            </div>

            {/* DELIVERY */}

            <div className="summary_row summary_delivery_row">
              <div className="summary_delivery_label">
                <span>Delivery Charge</span>
              </div>

              <strong>
                {orderType === 'delivery'
                  ? deliveryLoading
                    ? 'calculating...'
                    : `₹${deliveryCharge.toFixed(2)}`
                  : 'Free'}
              </strong>
            </div>

            {/* PAYU */}

            {paymentMethod === 'ONLINE' && (
              <div className="summary_row summary_payu_row">
                <div className="summary_payu_label">
                  <span>Convenience Charge</span>
                </div>

                <strong>₹{payuPricing.payuCharges.toFixed(2)}</strong>
              </div>
            )}

            <div className="checkout_summary_divider" />

            {/* FINAL TOTAL */}

            <div className="summary_total">
              <span>Final Customer Total</span>

              <strong>
                {deliveryLoading
                  ? 'Calculating...'
                  : `₹${payuPricing.customerPayableAmount.toFixed(2)}`}
              </strong>
            </div>
          </section>

          {/* ======================================
              SECURE NOTE
          ====================================== */}

          <div className="checkout_secure_note">
            <span>✓</span>

            <p>Your order details are securely processed by RMA.</p>
          </div>

          {/* ======================================
              PLACE ORDER
          ====================================== */}

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
        <div
          className="location_sheet_overlay"
          onClick={() => setShowLocationSheet(false)}
        >
          <div
            className={`location_sheet ${
              showMapPicker ? 'location_sheet_map_mode' : ''
            }`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="location_sheet_handle" />

            {!showMapPicker ? (
              <>
                <div className="location_sheet_header">
                  <h3>Choose delivery address</h3>

                  <button
                    type="button"
                    className="location_sheet_close"
                    onClick={() => setShowLocationSheet(false)}
                  >
                    ×
                  </button>
                </div>

                <button
                  type="button"
                  className="location_sheet_current"
                  onClick={() => {
                    setShowMapPicker(true);
                  }}
                >
                  <div className="location_sheet_option_icon">
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 2V6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <path
                        d="M12 18V22"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <path
                        d="M2 12H6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <path
                        d="M18 12H22"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="5"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>

                  <div>
                    <strong>Use current location</strong>
                    <span>Use your device's current location</span>
                  </div>

                  <span className="location_sheet_arrow">›</span>
                </button>

                <button
                  type="button"
                  className="location_sheet_add"
                  onClick={() => {
                    navigate('/profile/saved-addresses/add', {
                      state: {
                        returnToLocationSheet: true,
                        returnPath: '/checkout',
                      },
                    });
                  }}
                >
                  <div className="location_sheet_option_icon">
                    <span>+</span>
                  </div>

                  <div>
                    <strong>Add Address</strong>
                    <span>Add a new delivery address</span>
                  </div>

                  <span className="location_sheet_arrow">›</span>
                </button>

                <div className="location_sheet_saved">
                  <h4>Saved addresses</h4>

                  {loadingAddresses ? (
                    <p className="location_sheet_empty">Loading addresses...</p>
                  ) : savedAddresses.length === 0 ? (
                    <p className="location_sheet_empty">
                      No saved addresses yet.
                    </p>
                  ) : (
                    savedAddresses.map((savedAddress) => (
                      <button
                        type="button"
                        key={savedAddress._id}
                        className="location_sheet_saved_item"
                        onClick={() => handleSavedAddressSelect(savedAddress)}
                      >
                        <div className="location_sheet_saved_icon">
                          <span>
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M3 10.5L12 3L21 10.5V21H3V10.5Z"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />

                              <path
                                d="M9 21V14H15V21"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </span>
                        </div>

                        <div className="location_sheet_saved_content">
                          <strong>{savedAddress.label}</strong>
                          <span>{savedAddress.address}</span>
                        </div>

                        <span className="location_sheet_arrow">›</span>
                      </button>
                    ))
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="location_sheet_header">
                  <button
                    type="button"
                    className="location_sheet_back"
                    onClick={() => setShowMapPicker(false)}
                  >
                    ‹
                  </button>

                  <h3>Choose delivery location</h3>

                  <button
                    type="button"
                    className="location_sheet_close"
                    onClick={() => {
                      setShowMapPicker(false);
                      setShowLocationSheet(false);
                    }}
                  >
                    ×
                  </button>
                </div>

                <MapPicker
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
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

export default Checkout;
