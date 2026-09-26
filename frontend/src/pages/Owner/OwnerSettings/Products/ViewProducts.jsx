import './ViewProducts.css';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import ViewProductsHeader from './components/ViewProducts/ViewProductsHeader';
import ViewProductsMessages from './components/ViewProducts/ViewProductsMessages';
import ViewProductsSummary from './components/ViewProducts/ViewProductsSummary';
import ViewProductsFilters from './components/ViewProducts/ViewProductsFilters';
import ViewProductsEmpty from './components/ViewProducts/ViewProductsEmpty';
import ViewProductCard from './components/ViewProducts/ViewProductCard';

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

      const response = await fetch(
        'https://rma-backend-bo4a.onrender.com/api/owners/products',
        {
          headers: {
            Authorization: `Bearer ${ownerToken}`,
          },
        },
      );

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
        `https://rma-backend-bo4a.onrender.com/api/owners/products/${product.productId}/availability`,
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
        `https://rma-backend-bo4a.onrender.com/api/owners/products/${product.productId}`,
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
        <ViewProductsHeader navigate={navigate} shopName={shopName} />

        <ViewProductsMessages successMessage={successMessage} error={error} />

        <ViewProductsSummary
          products={products}
          availableCount={availableCount}
          unavailableCount={unavailableCount}
        />

        <ViewProductsFilters
          search={search}
          setSearch={setSearch}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          availabilityFilter={availabilityFilter}
          setAvailabilityFilter={setAvailabilityFilter}
          categories={categories}
        />

        {filteredProducts.length === 0 ? (
          <ViewProductsEmpty />
        ) : (
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <ViewProductCard
                key={product.productId}
                product={product}
                navigate={navigate}
                handleAvailabilityToggle={handleAvailabilityToggle}
                handleRemove={handleRemove}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ViewProducts;
