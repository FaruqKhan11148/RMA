import './ChangePrice.css';

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import ChangePriceHeader from './components/ChangePrice/ChangePriceHeader';
import ChangePriceMessages from './components/ChangePrice/ChangePriceMessages';
import ChangePriceProduct from './components/ChangePrice/ChangePriceProduct';
import ChangePriceField from './components/ChangePrice/ChangePriceField';
import ChangePriceActions from './components/ChangePrice/ChangePriceActions';

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
          'https://rma-backend-bo4a.onrender.com/api/owners/products',
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
        <ChangePriceHeader navigate={navigate} />

        <ChangePriceMessages error={error} successMessage={successMessage} />

        {product && (
          <form className="change-price-card" onSubmit={handleSubmit}>
            <ChangePriceProduct product={product} />

            <div className="change-price-divider" />

            <ChangePriceField
              product={product}
              price={price}
              setPrice={setPrice}
            />

            <ChangePriceActions navigate={navigate} saving={saving} />
          </form>
        )}
      </div>
    </div>
  );
}

export default ChangePrice;
