import './EditProduct.css';

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import EditProductHeader from './components/EditProduct/EditProductHeader';
import EditProductMessages from './components/EditProduct/EditProductMessages';
import EditProductPreview from './components/EditProduct/EditProductPreview';
import EditProductCustomFields from './components/EditProduct/EditProductCustomFields';
import EditProductPrice from './components/EditProduct/EditProductPrice';
import EditProductAvailability from './components/EditProduct/EditProductAvailability';
import EditProductActions from './components/EditProduct/EditProductActions';

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
        <EditProductHeader navigate={navigate} product={product} />

        <EditProductMessages error={error} successMessage={successMessage} />

        <form className="edit-product-card" onSubmit={handleSubmit}>
          <EditProductPreview product={product} available={available} />

          {product.isCustom && (
            <EditProductCustomFields
              name={name}
              setName={setName}
              category={category}
              setCategory={setCategory}
              unit={unit}
              setUnit={setUnit}
              imageUrl={imageUrl}
              setImageUrl={setImageUrl}
            />
          )}

          <EditProductPrice
            product={product}
            price={price}
            setPrice={setPrice}
          />

          <EditProductAvailability
            available={available}
            handleAvailabilityChange={handleAvailabilityChange}
          />

          <EditProductActions
            navigate={navigate}
            saving={saving}
            isCustom={product.isCustom}
          />
        </form>
      </div>
    </div>
  );
}

export default EditProduct;
