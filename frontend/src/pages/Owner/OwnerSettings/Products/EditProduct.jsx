import './EditProduct.css';

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function EditProduct() {
  const navigate = useNavigate();
  const { productId } = useParams();

  const [product, setProduct] = useState(null);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [available, setAvailable] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const token = localStorage.getItem('rma_owner_token');

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError('');

        if (!token) {
          navigate('/owner/login');
          return;
        }

        const response = await fetch(
          'https://rma-backend-bo4a.onrender.com/api/owners/products',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to load products.');
        }

        const foundProduct = data.products.find(
          (item) => item.productId === productId,
        );

        if (!foundProduct) {
          setError('Product not found.');
          return;
        }

        setProduct(foundProduct);

        setName(foundProduct.name);
        setCategory(foundProduct.category);
        setPrice(String(foundProduct.price));
        setUnit(foundProduct.unit);
        setImageUrl(foundProduct.imageUrl || '');
        setAvailable(foundProduct.available);
      } catch (error) {
        console.error('Load product failed:', error);

        setError(error.message || 'Failed to load product.');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [navigate, productId, token]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');
    setSuccessMessage('');

    if (!product) {
      return;
    }

    const newPrice = Number(price);

    if (!Number.isFinite(newPrice) || newPrice <= 0) {
      setError('Price must be greater than 0.');
      return;
    }

    if (product.isCustom) {
      if (!name.trim()) {
        setError('Product name is required.');
        return;
      }

      if (!category.trim()) {
        setError('Product category is required.');
        return;
      }

      if (!unit.trim()) {
        setError('Product unit is required.');
        return;
      }
    }

    try {
      setSaving(true);

      /*
       * RMA CATALOGUE PRODUCT
       *
       * Only price can be edited here.
       *
       * Availability is handled separately through:
       * PATCH /products/:productId/availability
       */
      if (!product.isCustom) {
        const response = await fetch(
          `https://rma-backend-bo4a.onrender.com/api/owners/products/${productId}/price`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              price: newPrice,
            }),
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to update product.');
        }

        setProduct(data.product);
        setPrice(String(data.product.price));

        setSuccessMessage('Product price updated successfully.');

        setTimeout(() => {
          navigate('/owner/settings/products');
        }, 1000);

        return;
      }

      /*
       * CUSTOM PRODUCT
       *
       * Custom products can edit:
       * name
       * category
       * price
       * unit
       * image
       */
      const response = await fetch(
        `https://rma-backend-bo4a.onrender.com/api/owners/products/${productId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: name.trim(),
            category: category.trim(),
            price: newPrice,
            unit: unit.trim(),
            imageUrl: imageUrl.trim(),
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update product.');
      }

      setProduct(data.product);

      setName(data.product.name);
      setCategory(data.product.category);
      setPrice(String(data.product.price));
      setUnit(data.product.unit);
      setImageUrl(data.product.imageUrl || '');

      setSuccessMessage('Product updated successfully.');

      setTimeout(() => {
        navigate('/owner/settings/products');
      }, 1000);
    } catch (error) {
      console.error('Update product failed:', error);

      setError(error.message || 'Failed to update product.');
    } finally {
      setSaving(false);
    }
  };

  const handleAvailabilityChange = async (newValue) => {
    if (!product) {
      return;
    }

    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch(
        `https://rma-backend-bo4a.onrender.com/api/owners/products/${productId}/availability`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            available: newValue,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update availability.');
      }

      setAvailable(data.product.available);
      setProduct(data.product);

      setSuccessMessage(
        data.message || 'Product availability updated successfully.',
      );
    } catch (error) {
      console.error('Update availability failed:', error);

      setError(error.message || 'Failed to update availability.');
    }
  };

  if (loading) {
    return (
      <div className="edit-product-page">
        <div className="edit-product-loading">Loading product...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="edit-product-page">
        <div className="edit-product-container">
          <button
            type="button"
            className="edit-product-back"
            onClick={() => navigate('/owner/settings/products')}
          >
            ← Products Settings
          </button>

          <div className="edit-product-error-card">
            {error || 'Product not found.'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-product-page">
      <div className="edit-product-container">
        <button
          type="button"
          className="edit-product-back"
          onClick={() => navigate('/owner/settings/products')}
        >
          ← Products
        </button>

        <div className="edit-product-header">
          <div>
            <h1>Edit Product</h1>

            <p>
              {product.isCustom
                ? 'Update your custom product details.'
                : 'Manage the selling price and availability.'}
            </p>
          </div>

          <span
            className={`edit-product-type ${
              product.isCustom ? 'custom' : 'catalogue'
            }`}
          >
            {product.isCustom ? 'Custom Product' : 'RMA Catalogue'}
          </span>
        </div>

        {error && <div className="edit-product-message error">{error}</div>}

        {successMessage && (
          <div className="edit-product-message success">✓ {successMessage}</div>
        )}

        <form className="edit-product-card" onSubmit={handleSubmit}>
          {/* =================================================
              PRODUCT PREVIEW
          ================================================= */}

          <div className="edit-product-preview">
            <div className="edit-product-image">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} />
              ) : (
                <span>
                  {product.category === 'Chicken'
                    ? '🍗'
                    : product.category === 'Mutton'
                      ? '🥩'
                      : product.category === 'Fish'
                        ? '🐟'
                        : product.category === 'Seafood'
                          ? '🦐'
                          : '🥩'}
                </span>
              )}
            </div>

            <div className="edit-product-preview-info">
              <h2>{product.name}</h2>

              <p>
                {product.category} • {product.unit}
              </p>

              <span
                className={`edit-product-status ${
                  available ? 'available' : 'unavailable'
                }`}
              >
                {available ? 'Available' : 'Unavailable'}
              </span>
            </div>
          </div>

          {/* =================================================
              CUSTOM PRODUCT FIELDS
          ================================================= */}

          {product.isCustom && (
            <>
              <div className="edit-product-divider" />

              <div className="edit-product-section">
                <div className="edit-product-section-title">
                  Product Information
                </div>

                <div className="edit-product-field">
                  <label htmlFor="name">Product Name</label>

                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Enter product name"
                  />
                </div>

                <div className="edit-product-grid">
                  <div className="edit-product-field">
                    <label htmlFor="category">Category</label>

                    <input
                      id="category"
                      type="text"
                      value={category}
                      onChange={(event) => setCategory(event.target.value)}
                      placeholder="e.g. Chicken"
                    />
                  </div>

                  <div className="edit-product-field">
                    <label htmlFor="unit">Unit</label>

                    <input
                      id="unit"
                      type="text"
                      value={unit}
                      onChange={(event) => setUnit(event.target.value)}
                      placeholder="e.g. KG"
                    />
                  </div>
                </div>

                <div className="edit-product-field">
                  <label htmlFor="imageUrl">Image URL</label>

                  <input
                    id="imageUrl"
                    type="url"
                    value={imageUrl}
                    onChange={(event) => setImageUrl(event.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
            </>
          )}

          {/* =================================================
              PRICE
          ================================================= */}

          <div className="edit-product-divider" />

          <div className="edit-product-section">
            <div className="edit-product-section-title">Selling Price</div>

            {!product.isCustom && (
              <div className="edit-product-info-note">
                RMA catalogue product details are controlled by RMA. Only the
                selling price can be changed.
              </div>
            )}

            <div className="edit-product-field">
              <label htmlFor="price">Price</label>

              <div className="edit-product-price-wrapper">
                <span>₹</span>

                <input
                  id="price"
                  type="number"
                  min="1"
                  step="0.01"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  placeholder="Enter price"
                  required
                />

                <span>/ {product.unit}</span>
              </div>
            </div>
          </div>

          {/* =================================================
              AVAILABILITY
          ================================================= */}

          <div className="edit-product-divider" />

          <div className="edit-product-availability">
            <div>
              <strong>Product Availability</strong>

              <p>
                {available
                  ? 'Customers can currently order this product.'
                  : 'Customers cannot currently order this product.'}
              </p>
            </div>

            <button
              type="button"
              className={`edit-product-toggle ${available ? 'active' : ''}`}
              onClick={() => handleAvailabilityChange(!available)}
              aria-label="Toggle product availability"
            >
              <span />
            </button>
          </div>

          {/* =================================================
              ACTIONS
          ================================================= */}

          <div className="edit-product-divider" />

          <div className="edit-product-actions">
            <button
              type="button"
              className="edit-product-cancel"
              onClick={() => navigate('/owner/settings/products')}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="edit-product-submit"
              disabled={saving}
            >
              {saving
                ? 'Saving...'
                : product.isCustom
                  ? 'Save Changes'
                  : 'Update Price'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProduct;
