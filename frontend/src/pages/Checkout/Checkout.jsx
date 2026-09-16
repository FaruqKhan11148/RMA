import './Checkout.css';

import MapPicker from '../../components/map/MapPicker';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useCart } from '../../context/CartContext';
import { useOrder } from '../../context/OrderContext';

function Checkout() {
  const navigate = useNavigate();

  const { cartItems, totalPrice } = useCart();

  const { createOrder } = useOrder();

  const orderType = 'delivery';
  const paymentMethod = 'ONLINE';

  const [deliveryLocation, setDeliveryLocation] = useState(null);

  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
    address: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [deliveryDistance, setDeliveryDistance] = useState(null);
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [payuConvenienceCharge, setPayuConvenienceCharge] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setCustomer((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // const handleOrderTypeChange = (type) => {
  //   setOrderType(type);
  //   setError('');

  //   if (type === 'pickup') {
  //     setDeliveryLocation(null);
  //   }
  // };

  useEffect(() => {
    if (orderType !== 'delivery' || !deliveryLocation) {
      setDeliveryDistance(null);
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

        setDeliveryDistance(data.deliveryDistance);
        setDeliveryCharge(data.deliveryCharge);
      } catch (error) {
        console.error('Delivery charge calculation failed:', error);

        setDeliveryDistance(null);
        setDeliveryCharge(0);
        setError(error.message || 'Unable to calculate delivery charge');
      } finally {
        setDeliveryLoading(false);
      }
    };

    calculateDeliveryCharge();
  }, [deliveryLocation, orderType, cartItems]);

  useEffect(() => {
    const baseAmount = totalPrice + deliveryCharge;

    const payuFee = baseAmount * 0.02;
    const gst = payuFee * 0.18;

    const totalPayuCharge = Number((payuFee + gst).toFixed(2));

    setPayuConvenienceCharge(totalPayuCharge);
  }, [totalPrice, deliveryCharge]);

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

      console.log('Sending Order:', orderData);

      const order = await createOrder(orderData);

      console.log('BACKEND CALCULATED ORDER:', {
        subtotal: order.subtotal,
        deliveryDistance: order.deliveryDistance,
        deliveryCharge: order.deliveryCharge,
        rmaFee: order.rmaFee,
        ownerAmount: order.ownerAmount,
        totalPrice: order.totalPrice,
      });

      console.log('Order Created:', order);

      navigate(`/payment/${order.orderId}`);
    } catch (error) {
      console.error('Create order failed:', error);

      setError(error.message || 'Unable to create order');
    } finally {
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

  const hasDelivery = shop.shopDelivery;

  return (
    <main className="checkout">
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
              ORDER TYPE
          ====================================== */}

          {hasDelivery && (
            <section className="checkout_card checkout_order_type">
              <div className="checkout_card_header">
                <div>
                  <span className="checkout_step">01</span>

                  <div>
                    <h2>Delivery</h2>

                    <p>Your order will be delivered to your doorstep.</p>
                  </div>
                </div>
              </div>

              <div className="order_type_options">
                <div className="order_type_option selected">
                  <div className="order_type_icon">
                    <span>⌖</span>
                  </div>

                  <div className="order_type_content">
                    <strong>Delivery</strong>

                    <span>Delivered to your doorstep</span>

                    <small>
                      {shop.deliverySettings?.estimatedDeliveryTime || 45} mins
                    </small>
                  </div>

                  <span className="order_type_check">✓</span>
                </div>
              </div>
            </section>
          )}

          {/* ======================================
              DELIVERY LOCATION
          ====================================== */}

          {orderType === 'delivery' && (
            <section className="checkout_card checkout_location_card">
              <div className="checkout_card_header">
                <div>
                  <span className="checkout_step">02</span>

                  <div>
                    <h2>Delivery Location</h2>

                    <p>Select exactly where you want your order delivered.</p>
                  </div>
                </div>
              </div>

              <div className="checkout_map">
                <MapPicker
                  onLocationSelect={(location) => {
                    console.log('Selected Delivery Location:', location);

                    setDeliveryLocation(location);
                    setError('');
                  }}
                />
              </div>

              {deliveryLocation && (
                <div className="location_selected">
                  <span className="location_selected_icon">✓</span>

                  <div>
                    <strong>Delivery location selected</strong>

                    <span>Your location has been pinned on the map.</span>
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
                <span className="checkout_step">03</span>

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
                  <label htmlFor="checkout-address">Delivery Address</label>

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

              {/* ==================================
                  PAYMENT METHOD
              ================================== */}

              <div className="checkout_payment">
                <div className="checkout_payment_header">
                  <div>
                    <span className="checkout_step">04</span>

                    <div>
                      <h2>Payment</h2>

                      <p>Pay securely online through PayU.</p>
                    </div>
                  </div>
                </div>

                <div className="payment_options">
                  <div className="payment_option selected">
                    <div className="payment_option_icon">↗</div>

                    <div className="payment_option_content">
                      <strong>Online Payment</strong>

                      <span>Pay securely online through PayU</span>
                    </div>

                    <span className="payment_check">✓</span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="checkout_error">
                  <span>!</span>

                  <p>{error}</p>
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
                <span>YOUR ORDER</span>

                <h2>Order Summary</h2>
              </div>

              <span className="checkout_summary_count">
                {cartItems.reduce((total, item) => total + item.quantity, 0)}{' '}
                items
              </span>
            </div>

            <div className="checkout_summary_shop">
              <div className="checkout_summary_shop_icon">R</div>

              <div>
                <span>SHOP</span>

                <strong>{shop.shopName}</strong>
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
                <span>Delivery</span>

                {orderType === 'delivery' && (
                  <small>
                    ₹18 + ₹8/km
                    {deliveryDistance !== null && ` • ${deliveryDistance} km`}
                  </small>
                )}
              </div>

              <strong>
                {orderType === 'delivery'
                  ? deliveryLoading
                    ? 'Calculating...'
                    : `₹${deliveryCharge.toFixed(2)}`
                  : 'Free'}
              </strong>
            </div>

            {/* PAYU */}

            {paymentMethod === 'ONLINE' && (
              <div className="summary_row summary_payu_row">
                <div className="summary_payu_label">
                  <span>PayU Convenience Charge</span>

                  <small>2% + 18% GST</small>
                </div>

                <strong>₹{payuConvenienceCharge.toFixed(2)}</strong>
              </div>
            )}

            <div className="checkout_summary_divider" />

            {/* FINAL TOTAL */}

            <div className="summary_total">
              <span>Final Customer Total</span>

              <strong>
                {deliveryLoading
                  ? 'Calculating...'
                  : `₹${(
                      totalPrice +
                      deliveryCharge +
                      payuConvenienceCharge
                    ).toFixed(2)}`}
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
    </main>
  );
}

export default Checkout;
