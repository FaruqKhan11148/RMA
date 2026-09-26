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

  const handleAddToCart = (product) => {
    if (!isShopCurrentlyOpen(shop)) {
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

      <ShopHero shop={shop} onBack={() => navigate(-1)} />

      <ShopCategories
        categories={shop.categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      <ShopProducts products={filteredProducts} onAddToCart={handleAddToCart} />

      {totalItems > 0 && cartItems.length > 0 && (
        <FloatingCartBar cartItems={cartItems} totalItems={totalItems} />
      )}
    </main>
  );
}

export default Shop;
