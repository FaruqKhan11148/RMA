import './ChangePrice.css';

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function ChangePrice() {
  const navigate = useNavigate();
  const { productId } = useParams();

  const [product, setProduct] = useState(null);
  const [price, setPrice] = useState('');

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
          'http://localhost:5000api/owners/products',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to load products');
        }

        const foundProduct = data.products.find(
          (item) => item.productId === productId,
        );

        if (!foundProduct) {
          setError('Product not found.');
          return;
        }

        setProduct(foundProduct);
        setPrice(String(foundProduct.price));
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

    const newPrice = Number(price);

    if (!Number.isFinite(newPrice) || newPrice <= 0) {
      setError('Price must be greater than 0.');
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `http://localhost:5000api/owners/products/${productId}/price`,
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
        throw new Error(data.message || 'Failed to update price.');
      }

      setProduct(data.product);
      setPrice(String(data.product.price));

      setSuccessMessage('Product price updated successfully.');

      setTimeout(() => {
        navigate('/owner/settings/products');
      }, 1000);
    } catch (error) {
      console.error('Update price failed:', error);

      setError(error.message || 'Failed to update product price.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="change-price-page">
        <div className="change-price-loading">Loading product...</div>
      </div>
    );
  }

  return (
    <div className="change-price-page">
      <div className="change-price-container">
        <button
          type="button"
          className="change-price-back"
          onClick={() => navigate('/owner/settings/products')}
        >
          ← Products Settings
        </button>

        <div className="change-price-header">
          <h1>Change Price</h1>

          <p>Update the selling price of this product.</p>
        </div>

        {error && <div className="change-price-message error">{error}</div>}

        {successMessage && (
          <div className="change-price-message success">✓ {successMessage}</div>
        )}

        {product && (
          <form className="change-price-card" onSubmit={handleSubmit}>
            <div className="change-price-product">
              <div className="change-price-image">
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

              <div className="change-price-product-info">
                <h2>{product.name}</h2>

                <p>
                  {product.category} • {product.unit}
                </p>

                <div className="change-price-current">
                  <span>Current Price</span>

                  <strong>
                    ₹{product.price} / {product.unit}
                  </strong>
                </div>
              </div>
            </div>

            <div className="change-price-divider" />

            <div className="change-price-field">
              <label htmlFor="price">New Selling Price</label>

              <div className="change-price-input-wrapper">
                <span>₹</span>

                <input
                  id="price"
                  type="number"
                  min="1"
                  step="0.01"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  placeholder="Enter new price"
                  required
                />

                <span>/ {product.unit}</span>
              </div>
            </div>

            <div className="change-price-actions">
              <button
                type="button"
                className="change-price-cancel"
                onClick={() => navigate('/owner/settings/products')}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="change-price-submit"
                disabled={saving}
              >
                {saving ? 'Updating...' : 'Update Price'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default ChangePrice;
