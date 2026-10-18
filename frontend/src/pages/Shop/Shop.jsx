import './Shop.css';

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import FlashMessage from '../../components/FlashMessage/FlashMessage';
import { useCart } from '../../context/CartContext';

import { isShopCurrentlyOpen } from './utils/shopHelpers';

import FloatingCartBar from './components/FloatingCartBar';
import ShopCategories from './components/ShopCategories';
import ShopHero from './components/ShopHero';
import ShopProducts from './components/ShopProducts';

const API_URL =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/'
    : 'https://rma-backend-bo4a.onrender.com/';

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

        const response = await fetch(`${API_URL}api/owners/shop/${shopId}`);

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || 'Shop not found');
          return;
        }

        if (!data.shop?.isOpen) {
          navigate('/shop-closed', {
            replace: true,
            state: {
              shopName: data.shop?.shopName,
              shopId: data.shop?.shopId || shopId,
            },
          });

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
  }, [shopId, navigate]);

  const handleBulkOrdersClick = () => {
    navigate(`/shop/${shopId}/bulk-orders`);
  };

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

  const handleAddToCart = (product) => {
    if (!isShopCurrentlyOpen(shop)) {
      setFlashMessage('Shop is currently closed.');
      return;
    }

    addToCart(product, shop);
  };

  const isBulkOrdersSelected = selectedCategory === 'Bulk Orders';

  const filteredProducts = isBulkOrdersSelected
    ? []
    : selectedCategory === 'All'
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

      <ShopHero shop={shop} onBack={() => navigate(-1)} />

      <ShopCategories
        categories={shop.categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        onBulkOrdersClick={handleBulkOrdersClick}
      />

      {isBulkOrdersSelected ? (
        <section className="bulk_orders_placeholder">
          <h2>Bulk Orders</h2>
          <p>
            For hotels, restaurants, shawarma shops, and other business buyers.
          </p>
          <p>Bulk ordering is coming soon.</p>
        </section>
      ) : (
        <ShopProducts
          products={filteredProducts}
          onAddToCart={handleAddToCart}
        />
      )}

      {totalItems > 0 && cartItems.length > 0 && (
        <FloatingCartBar cartItems={cartItems} totalItems={totalItems} />
      )}
    </main>
  );
}

export default Shop;
