import './AddProduct.css';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import productCatalogue from '../../../../data/productCatalogue';

import AddProductHeader from './components/AddProduct/AddProductHeader';
import AddProductMessages from './components/AddProduct/AddProductMessages';
import ProductTypeSelector from './components/AddProduct/ProductTypeSelector';
import CatalogueProductForm from './components/AddProduct/CatalogueProductForm';
import CustomProductForm from './components/AddProduct/CustomProductForm';
import AddProductActions from './components/AddProduct/AddProductActions';

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

  const loadExistingProducts = useCallback(async () => {
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
  }, [ownerToken]);

  useEffect(() => {
    if (!ownerToken) {
      navigate('/owner/login');
      return;
    }

    loadExistingProducts();
  }, [ownerToken, navigate, loadExistingProducts]);

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
        <AddProductHeader navigate={navigate} />

        <AddProductMessages successMessage={successMessage} error={error} />

        <ProductTypeSelector
          productType={productType}
          setProductType={setProductType}
          setError={setError}
          setSuccessMessage={setSuccessMessage}
        />

        <form className="add-product-card" onSubmit={handleSubmit}>
          {productType === 'catalogue' ? (
            <CatalogueProductForm
              productCatalogue={productCatalogue}
              selectedCategoryId={selectedCategoryId}
              selectedCategory={selectedCategory}
              selectedProductId={selectedProductId}
              selectedCatalogueProduct={selectedCatalogueProduct}
              existingProducts={existingProducts}
              price={price}
              handleCategoryChange={handleCategoryChange}
              handleCatalogueProductChange={handleCatalogueProductChange}
              setPrice={setPrice}
            />
          ) : (
            <CustomProductForm
              customProductName={customProductName}
              setCustomProductName={setCustomProductName}
              customProductCategory={customProductCategory}
              setCustomProductCategory={setCustomProductCategory}
              customProductPrice={customProductPrice}
              setCustomProductPrice={setCustomProductPrice}
              customProductUnit={customProductUnit}
              setCustomProductUnit={setCustomProductUnit}
              customProductImage={customProductImage}
              setCustomProductImage={setCustomProductImage}
            />
          )}

          <AddProductActions navigate={navigate} saving={saving} />
        </form>
      </div>
    </div>
  );
}

export default AddProduct;
