import './AddProduct.css';

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import productCatalogue from '../../../../data/productCatalogue';

function AddProduct() {
  const navigate = useNavigate();

  const ownerToken = localStorage.getItem('rma_owner_token');

  const [productType, setProductType] = useState('catalogue');

  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  const [selectedProductId, setSelectedProductId] = useState('');

  const [price, setPrice] = useState('');

  const [customProductName, setCustomProductName] = useState('');

  const [customProductCategory, setCustomProductCategory] = useState('');

  const [customProductPrice, setCustomProductPrice] = useState('');

  const [customProductUnit, setCustomProductUnit] = useState('');

  const [customProductImage, setCustomProductImage] = useState('');

  const [existingProducts, setExistingProducts] = useState([]);

  const [loadingProducts, setLoadingProducts] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');

  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!ownerToken) {
      navigate('/owner/login');
      return;
    }

    loadExistingProducts();
  }, [ownerToken, navigate]);

  const loadExistingProducts = async () => {
    try {
      setLoadingProducts(true);
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

      setExistingProducts(data.products || []);
    } catch (err) {
      setError(err.message || 'Failed to load existing products');
    } finally {
      setLoadingProducts(false);
    }
  };

  const selectedCategory = useMemo(() => {
    return productCatalogue.find(
      (category) => category.categoryId === selectedCategoryId,
    );
  }, [selectedCategoryId]);

  const selectedCatalogueProduct = useMemo(() => {
    return selectedCategory?.products?.find(
      (product) => product.productId === selectedProductId,
    );
  }, [selectedCategory, selectedProductId]);

  const handleCategoryChange = (event) => {
    setSelectedCategoryId(event.target.value);
    setSelectedProductId('');
    setPrice('');
    setError('');
  };

  const handleCatalogueProductChange = (event) => {
    setSelectedProductId(event.target.value);
    setPrice('');
    setError('');
  };

  const isCatalogueProductAlreadyAdded = useMemo(() => {
    if (!selectedCatalogueProduct) {
      return false;
    }

    return existingProducts.some(
      (product) =>
        product.catalogueProductId === selectedCatalogueProduct.productId,
    );
  }, [existingProducts, selectedCatalogueProduct]);

  const resetForm = () => {
    setSelectedCategoryId('');
    setSelectedProductId('');
    setPrice('');

    setCustomProductName('');
    setCustomProductCategory('');
    setCustomProductPrice('');
    setCustomProductUnit('');
    setCustomProductImage('');

    setError('');
  };

  const handleAddCatalogueProduct = async () => {
    if (!selectedCatalogueProduct) {
      setError('Please select a catalogue product.');
      return;
    }

    if (isCatalogueProductAlreadyAdded) {
      setError('This catalogue product is already added.');
      return;
    }

    const productPrice = Number(price);

    if (!Number.isFinite(productPrice) || productPrice <= 0) {
      setError('Enter a valid product price.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccessMessage('');

      const response = await fetch(
        'https://rma-backend-bo4a.onrender.com/api/owners/products',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${ownerToken}`,
          },
          body: JSON.stringify({
            catalogueProductId: selectedCatalogueProduct.productId,

            name: selectedCatalogueProduct.name,

            category: selectedCategory.categoryName,

            price: productPrice,

            unit: selectedCatalogueProduct.unit,

            imageUrl: selectedCatalogueProduct.imageUrl,

            isCustom: false,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add product');
      }

      setExistingProducts(data.products || []);

      setSuccessMessage(`${selectedCatalogueProduct.name} added successfully.`);

      resetForm();
    } catch (err) {
      setError(err.message || 'Failed to add product');
    } finally {
      setSaving(false);
    }
  };

  const handleAddCustomProduct = async () => {
    const name = customProductName.trim();
    const category = customProductCategory.trim();
    const unit = customProductUnit.trim();
    const productPrice = Number(customProductPrice);

    if (!name) {
      setError('Product name is required.');
      return;
    }

    if (!category) {
      setError('Product category is required.');
      return;
    }

    if (!unit) {
      setError('Product unit is required.');
      return;
    }

    if (!Number.isFinite(productPrice) || productPrice <= 0) {
      setError('Enter a valid product price.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccessMessage('');

      const response = await fetch(
        'https://rma-backend-bo4a.onrender.com/api/owners/products',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${ownerToken}`,
          },
          body: JSON.stringify({
            catalogueProductId: null,
            name,
            category,
            price: productPrice,
            unit,
            imageUrl: customProductImage.trim(),
            isCustom: true,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add product');
      }

      setExistingProducts(data.products || []);

      setSuccessMessage(`${name} added successfully.`);

      resetForm();
    } catch (err) {
      setError(err.message || 'Failed to add product');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (productType === 'catalogue') {
      await handleAddCatalogueProduct();
    } else {
      await handleAddCustomProduct();
    }
  };

  if (loadingProducts) {
    return (
      <div className="add-product-page">
        <div className="add-product-loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="add-product-page">
      <div className="add-product-container">
        {/* HEADER */}

        <div className="add-product-header">
          <button
            className="add-product-back"
            onClick={() => navigate('/owner/settings/products')}
          >
            ← Products
          </button>

          <h1>Add Product</h1>

          <p>Add a product to your shop catalogue.</p>
        </div>

        {/* MESSAGES */}

        {successMessage && (
          <div className="add-product-success">{successMessage}</div>
        )}

        {error && <div className="add-product-error">{error}</div>}

        {/* PRODUCT TYPE */}

        <div className="product-type-selector">
          <button
            type="button"
            className={
              productType === 'catalogue' ? 'type-option active' : 'type-option'
            }
            onClick={() => {
              setProductType('catalogue');
              setError('');
              setSuccessMessage('');
            }}
          >
            <span className="type-option-title">RMA Catalogue</span>

            <span className="type-option-description">
              Add an official RMA product
            </span>
          </button>

          <button
            type="button"
            className={
              productType === 'custom' ? 'type-option active' : 'type-option'
            }
            onClick={() => {
              setProductType('custom');
              setError('');
              setSuccessMessage('');
            }}
          >
            <span className="type-option-title">Custom Product</span>

            <span className="type-option-description">
              Add your own product
            </span>
          </button>
        </div>

        {/* FORM */}

        <form className="add-product-card" onSubmit={handleSubmit}>
          {productType === 'catalogue' ? (
            <>
              <div className="form-section">
                <h2>RMA Catalogue Product</h2>

                <p>
                  Choose a product from the RMA catalogue and set your selling
                  price.
                </p>
              </div>

              {/* CATEGORY */}

              <div className="form-group">
                <label>Category</label>

                <select
                  value={selectedCategoryId}
                  onChange={handleCategoryChange}
                >
                  <option value="">Select category</option>

                  {productCatalogue.map((category) => (
                    <option
                      key={category.categoryId}
                      value={category.categoryId}
                    >
                      {category.categoryName}
                    </option>
                  ))}
                </select>
              </div>

              {/* PRODUCT */}

              {selectedCategory && (
                <div className="form-group">
                  <label>Product</label>

                  <select
                    value={selectedProductId}
                    onChange={handleCatalogueProductChange}
                  >
                    <option value="">Select product</option>

                    {selectedCategory.products.map((product) => {
                      const alreadyAdded = existingProducts.some(
                        (existing) =>
                          existing.catalogueProductId === product.productId,
                      );

                      return (
                        <option
                          key={product.productId}
                          value={product.productId}
                          disabled={alreadyAdded}
                        >
                          {product.name}
                          {alreadyAdded ? ' — Already added' : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              {/* PREVIEW */}

              {selectedCatalogueProduct && (
                <div className="catalogue-preview">
                  <div className="catalogue-preview-image">
                    {selectedCatalogueProduct.imageUrl ? (
                      <img
                        src={selectedCatalogueProduct.imageUrl}
                        alt={selectedCatalogueProduct.name}
                      />
                    ) : (
                      <span>🍗</span>
                    )}
                  </div>

                  <div>
                    <span className="preview-label">RMA Catalogue</span>

                    <h3>{selectedCatalogueProduct.name}</h3>

                    <p>Category: {selectedCategory.categoryName}</p>

                    <p>Unit: {selectedCatalogueProduct.unit}</p>
                  </div>
                </div>
              )}

              {/* PRICE */}

              {selectedCatalogueProduct && (
                <div className="form-group">
                  <label>Your Selling Price</label>

                  <div className="price-input">
                    <span>₹</span>

                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      placeholder="Enter price"
                      value={price}
                      onChange={(event) => setPrice(event.target.value)}
                    />
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="form-section">
                <h2>Custom Product</h2>

                <p>Create a product specific to your shop.</p>
              </div>

              {/* NAME */}

              <div className="form-group">
                <label>Product Name</label>

                <input
                  type="text"
                  placeholder="e.g. Special Chicken Curry Cut"
                  value={customProductName}
                  onChange={(event) => setCustomProductName(event.target.value)}
                />
              </div>

              {/* CATEGORY */}

              <div className="form-group">
                <label>Category</label>

                <input
                  type="text"
                  placeholder="e.g. Chicken"
                  value={customProductCategory}
                  onChange={(event) =>
                    setCustomProductCategory(event.target.value)
                  }
                />
              </div>

              {/* PRICE + UNIT */}

              <div className="form-row">
                <div className="form-group">
                  <label>Price</label>

                  <div className="price-input">
                    <span>₹</span>

                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      placeholder="300"
                      value={customProductPrice}
                      onChange={(event) =>
                        setCustomProductPrice(event.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Unit</label>

                  <input
                    type="text"
                    placeholder="KG"
                    value={customProductUnit}
                    onChange={(event) =>
                      setCustomProductUnit(event.target.value)
                    }
                  />
                </div>
              </div>

              {/* IMAGE */}

              <div className="form-group">
                <label>
                  Image URL
                  <span className="optional">Optional</span>
                </label>

                <input
                  type="url"
                  placeholder="https://..."
                  value={customProductImage}
                  onChange={(event) =>
                    setCustomProductImage(event.target.value)
                  }
                />
              </div>
            </>
          )}

          {/* ACTIONS */}

          <div className="add-product-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={() => navigate('/owner/settings/products')}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="save-product-button"
              disabled={saving}
            >
              {saving ? 'Adding...' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddProduct;
