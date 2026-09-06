import './ViewProducts.css';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ViewProducts() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [shopName, setShopName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [availabilityFilter, setAvailabilityFilter] = useState('ALL');

  const ownerToken = localStorage.getItem('rma_owner_token');

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('http://localhost:5000api/owners/products', {
        headers: {
          Authorization: `Bearer ${ownerToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load products');
      }

      setProducts(data.products || []);
      setShopName(data.shopName || '');
    } catch (err) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [ownerToken]);

  useEffect(() => {
    if (!ownerToken) {
      navigate('/owner/login');
      return;
    }

    fetchProducts();
  }, [ownerToken, navigate, fetchProducts]);

  const categories = useMemo(() => {
    return ['ALL', ...new Set(products.map((product) => product.category))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.category.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        categoryFilter === 'ALL' || product.category === categoryFilter;

      const matchesAvailability =
        availabilityFilter === 'ALL' ||
        (availabilityFilter === 'AVAILABLE' && product.available) ||
        (availabilityFilter === 'UNAVAILABLE' && !product.available);

      return matchesSearch && matchesCategory && matchesAvailability;
    });
  }, [products, search, categoryFilter, availabilityFilter]);

  const handleAvailabilityToggle = async (product) => {
    try {
      setError('');
      setSuccessMessage('');

      const response = await fetch(
        `http://localhost:5000api/owners/products/${product.productId}/availability`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${ownerToken}`,
          },
          body: JSON.stringify({
            available: !product.available,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update availability');
      }

      setProducts(data.products || []);

      setSuccessMessage(
        product.available
          ? `${product.name} is now unavailable`
          : `${product.name} is now available`,
      );

      setTimeout(() => {
        setSuccessMessage('');
      }, 2500);
    } catch (err) {
      setError(err.message || 'Failed to update availability');
    }
  };

  const handleRemove = async (product) => {
    const confirmed = window.confirm(
      `Remove "${product.name}" from your products?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setError('');
      setSuccessMessage('');

      const response = await fetch(
        `http://localhost:5000api/owners/products/${product.productId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${ownerToken}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to remove product');
      }

      setProducts(data.products || []);

      setSuccessMessage(`${product.name} removed successfully`);

      setTimeout(() => {
        setSuccessMessage('');
      }, 2500);
    } catch (err) {
      setError(err.message || 'Failed to remove product');
    }
  };

  const availableCount = products.filter((product) => product.available).length;

  const unavailableCount = products.filter(
    (product) => !product.available,
  ).length;

  if (loading) {
    return (
      <div className="products-page">
        <div className="products-loading">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="products-container">
        {/* HEADER */}
        <div className="products-header">
          <div>
            <button
              className="products-back-button"
              onClick={() => navigate('/owner/settings/account')}
            >
              ← Products Settings
            </button>

            <h1>Products</h1>

            <p>
              Manage the products available at <strong>{shopName}</strong>
            </p>
          </div>

          <button
            className="add-product-button"
            onClick={() => navigate('/owner/settings/products/add')}
          >
            + Add Product
          </button>
        </div>

        {/* MESSAGES */}
        {successMessage && (
          <div className="products-success">{successMessage}</div>
        )}

        {error && <div className="products-error">{error}</div>}

        {/* SUMMARY */}
        <div className="products-summary">
          <div className="summary-card">
            <span>Total Products</span>
            <strong>{products.length}</strong>
          </div>

          <div className="summary-card">
            <span>Available</span>
            <strong>{availableCount}</strong>
          </div>

          <div className="summary-card">
            <span>Unavailable</span>
            <strong>{unavailableCount}</strong>
          </div>
        </div>

        {/* FILTERS */}
        <div className="products-filters">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === 'ALL' ? 'All Categories' : category}
              </option>
            ))}
          </select>

          <select
            value={availabilityFilter}
            onChange={(event) => setAvailabilityFilter(event.target.value)}
          >
            <option value="ALL">All Products</option>

            <option value="AVAILABLE">Available</option>

            <option value="UNAVAILABLE">Unavailable</option>
          </select>
        </div>

        {/* PRODUCTS */}
        {filteredProducts.length === 0 ? (
          <div className="products-empty">
            <div className="products-empty-icon">🛒</div>

            <h2>No products found</h2>

            <p>
              {products.length === 0
                ? 'Add your first product to start selling.'
                : 'Try changing your search or filters.'}
            </p>

            {products.length === 0 && (
              <button
                className="add-product-button"
                onClick={() => navigate('/owner/settings/products/add')}
              >
                + Add Product
              </button>
            )}
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <div
                className={`product-card ${
                  !product.available ? 'product-card-unavailable' : ''
                }`}
                key={product.productId}
              >
                {/* IMAGE */}
                <div className="product-image-wrapper">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="product-image"
                    />
                  ) : (
                    <div className="product-image-placeholder">
                      {product.category === 'Chicken'
                        ? '🍗'
                        : product.category === 'Mutton'
                          ? '🥩'
                          : product.category === 'Fish'
                            ? '🐟'
                            : product.category === 'Seafood'
                              ? '🦐'
                              : product.category === 'Eggs'
                                ? '🥚'
                                : '🛒'}
                    </div>
                  )}

                  <span
                    className={`availability-badge ${
                      product.available ? 'available' : 'unavailable'
                    }`}
                  >
                    {product.available ? 'Available' : 'Unavailable'}
                  </span>
                </div>

                {/* CONTENT */}
                <div className="product-card-content">
                  <div className="product-card-top">
                    <div>
                      <span className="product-category">
                        {product.category}
                      </span>

                      <h3>{product.name}</h3>
                    </div>

                    <span
                      className={`product-type ${
                        product.isCustom ? 'custom' : 'catalogue'
                      }`}
                    >
                      {product.isCustom ? 'Custom' : 'RMA'}
                    </span>
                  </div>

                  <div className="product-price">
                    ₹{Number(product.price).toFixed(0)}
                    <span>/ {product.unit}</span>
                  </div>

                  {/* ACTIONS */}
                  <div className="product-actions">
                    <button
                      className={`availability-button ${
                        product.available
                          ? 'make-unavailable'
                          : 'make-available'
                      }`}
                      onClick={() => handleAvailabilityToggle(product)}
                    >
                      {product.available
                        ? 'Mark Unavailable'
                        : 'Mark Available'}
                    </button>

                    <div className="secondary-actions">
                      <button
                        onClick={() =>
                          navigate(
                            `/owner/settings/products/change-price/${product.productId}`,
                          )
                        }
                      >
                        Price
                      </button>

                      <button
                        onClick={() =>
                          navigate(
                            `/owner/settings/products/edit/${product.productId}`,
                          )
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="remove-button"
                        onClick={() => handleRemove(product)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ViewProducts;
