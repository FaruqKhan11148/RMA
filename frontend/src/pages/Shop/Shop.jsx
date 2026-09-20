import './Shop.css';

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import FlashMessage from '../../components/FlashMessage/FlashMessage';
import { useCart } from '../../context/CartContext';

const optimizeCloudinaryImage = (url, width = 400) => {
  if (!url || !url.includes('res.cloudinary.com')) {
    return url;
  }

  return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`);
};

function Shop() {
  const { shopId } = useParams();
  const navigate = useNavigate();

  const { addToCart, cartItems, totalItems } = useCart();

  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [flashMessage, setFlashMessage] = useState('');

  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const fetchShop = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(
          `https://rma-backend-bo4a.onrender.com/api/owners/shop/${shopId}`,
        );

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || 'Shop not found');
          return;
        }

        setShop(data.shop);
      } catch (error) {
        console.error('Fetch shop failed:', error);
        setError('Unable to connect to server');
      } finally {
        setLoading(false);
      }
    };

    fetchShop();
  }, [shopId]);

  if (loading) {
    return (
      <main className="shop_not_found">
        <h1>Loading Shop...</h1>
      </main>
    );
  }

  if (error || !shop) {
    return (
      <main className="shop_not_found">
        <h1>Shop Not Found</h1>
        <p>{error || "We couldn't find a shop with this ID."}</p>
      </main>
    );
  }

  const isShopCurrentlyOpen = () => {
    const openingTime = shop.deliverySettings?.openingTime;
    const closingTime = shop.deliverySettings?.closingTime;
    const shopStatusMode = shop.deliverySettings?.shopStatusMode;

    if (!openingTime || !closingTime) {
      return true;
    }

    if (shopStatusMode === 'open') {
      return true;
    }

    if (shopStatusMode === 'closed') {
      return false;
    }

    const now = new Date();

    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [openingHour, openingMinute] = openingTime.split(':').map(Number);
    const [closingHour, closingMinute] = closingTime.split(':').map(Number);

    const openingMinutes = openingHour * 60 + openingMinute;
    const closingMinutes = closingHour * 60 + closingMinute;

    if (openingMinutes < closingMinutes) {
      return (
        currentMinutes >= openingMinutes && currentMinutes < closingMinutes
      );
    }

    if (openingMinutes > closingMinutes) {
      return (
        currentMinutes >= openingMinutes || currentMinutes < closingMinutes
      );
    }

    return true;
  };

  const handleAddToCart = (product) => {
    if (!isShopCurrentlyOpen()) {
      setFlashMessage('Shop is currently closed.');
      return;
    }

    addToCart(product, shop);
  };

  const filteredProducts =
    selectedCategory === 'All'
      ? shop.products
      : shop.products.filter(
          (product) => product.category === selectedCategory,
        );

  return (
    <main className="shop">
      <FlashMessage
        message={flashMessage}
        onClose={() => setFlashMessage('')}
      />
      <section className="shop_hero">
        <div className="shop_hero_top">
          <button
            type="button"
            className="shop_back_button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <span>←</span>
            <span>Back</span>
          </button>

          <span className="shop_hero_id">{shop.shopId}</span>
        </div>

        <div className="shop_hero_content">
          <div className="shop_status_row">
            <span
              className={
                shop.isOpen
                  ? 'shop_status_badge shop_status_open'
                  : 'shop_status_badge shop_status_closed'
              }
            >
              <span className="shop_status_dot" />

              {shop.isOpen ? 'Open Now' : 'Closed'}
            </span>
          </div>

          <h1>{shop.shopName}</h1>

          <div className="shop_rating">
            <span className="shop_rating_star">★</span>

            <span className="shop_rating_average">
              {Number(shop.rating?.average || 0).toFixed(1)}
            </span>

            <span className="shop_rating_count">
              {shop.rating?.count || 0}{' '}
              {shop.rating?.count === 1 ? 'review' : 'reviews'}
            </span>
          </div>

          {shop.description && (
            <p className="shop_hero_description">{shop.description}</p>
          )}

          <div className="shop_location">
            <span className="rma_location_arrow_shop">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 21C12 21 19 14.5 19 9C19 5.134 15.866 2 12 2C8.134 2 5 5.134 5 9C5 14.5 12 21 12 21Z"
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
            </span>

            <span>{shop.address}</span>
          </div>
        </div>
      </section>

      <section className="categories">
        <h2>Categories</h2>

        <div className="category_list">
          <button
            className={selectedCategory === 'All' ? 'category_active' : ''}
            onClick={() => setSelectedCategory('All')}
          >
            All
          </button>

          {shop.categories.map((category) => (
            <button
              key={category}
              className={selectedCategory === category ? 'category_active' : ''}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      <section className="products">
        <div className="products_header">
          <h2>Available Products</h2>

          <span>{filteredProducts.length} items</span>
        </div>

        <div className="product_list">
          {filteredProducts.length === 0 ? (
            <p>No products available.</p>
          ) : (
            filteredProducts.map((product) => (
              <div className="product_card" key={product.productId}>
                <div className="product_image">
                  {product.imageUrl ? (
                    <img
                      src={optimizeCloudinaryImage(product.imageUrl, 400)}
                      alt={product.name}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="product_image_placeholder">RMA</div>
                  )}
                </div>

                <div className="product_info">
                  <h3>{product.name}</h3>

                  <p>{product.unit}</p>

                  <strong>₹{product.price}</strong>
                </div>

                <button
                  className="add_button"
                  disabled={!product.available}
                  onClick={() => handleAddToCart(product)}
                >
                  {product.available ? 'Add' : 'Unavailable'}
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      {totalItems > 0 && cartItems.length > 0 && (
        <div className="floating_cart_bar">
          <div className="floating_cart_item">
            <div className="floating_cart_image">
              {cartItems[0].imageUrl ? (
                <img
                  src={optimizeCloudinaryImage(cartItems[0].imageUrl, 150)}
                  alt={cartItems[0].productName}
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div className="floating_cart_image_placeholder">RMA</div>
              )}
            </div>

            <div className="floating_cart_info">
              <strong>{cartItems[0].productName}</strong>

              <span>
                {totalItems} {totalItems === 1 ? 'item' : 'items'}
              </span>
            </div>

            <button
              type="button"
              className="floating_cart_button"
              onClick={() => navigate('/cart')}
            >
              <span>View Cart</span>
              <span>→</span>
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default Shop;
