import './Shop.css';

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useCart } from '../../context/CartContext';

function Shop() {
  const { shopId } = useParams();
  const navigate = useNavigate();

  const { addToCart, totalItems } = useCart();

  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [orderType, setOrderType] = useState('delivery');

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

  const filteredProducts =
    selectedCategory === 'All'
      ? shop.products
      : shop.products.filter(
          (product) => product.category === selectedCategory,
        );

  return (
    <main className="shop">
      <section className="shop_header">
        <p className="shop_id">{shop.shopId}</p>

        <h1>Welcome to {shop.shopName}</h1>

        <p className="shop_description">{shop.description}</p>

        <div className="shop_status">
          <span className={shop.isOpen ? 'status_open' : 'status_closed'}>
            {shop.isOpen ? 'Open' : 'Closed'}
          </span>

          <span>{shop.address}</span>
        </div>
      </section>

      <section className="order_options">
        {shop.delivery && (
          <button
            className={orderType === 'delivery' ? 'order_type_active' : ''}
            onClick={() => setOrderType('delivery')}
          >
            Delivery
          </button>
        )}

        {shop.pickup && (
          <button
            className={orderType === 'pickup' ? 'order_type_active' : ''}
            onClick={() => setOrderType('pickup')}
          >
            Pickup
          </button>
        )}
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
          <h2>Products</h2>

          <span>{filteredProducts.length} items</span>
        </div>

        <div className="product_list">
          {filteredProducts.length === 0 ? (
            <p>No products available.</p>
          ) : (
            filteredProducts.map((product) => (
              <div className="product_card" key={product.productId}>
                <div className="product_info">
                  <h3>{product.name}</h3>

                  <p>{product.unit}</p>

                  <strong>₹{product.price}</strong>
                </div>

                <button
                  className="add_button"
                  disabled={!product.available}
                  onClick={() => addToCart(product, shop)}
                >
                  {product.available ? 'Add' : 'Unavailable'}
                </button>
              </div>
            ))
          )}
        </div>
        {totalItems > 0 && (
          <div className="continue_cart_container">
            <button
              type="button"
              className="continue_cart_button"
              onClick={() => navigate('/cart')}
            >
              Continue to Cart
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

export default Shop;
