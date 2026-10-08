import './OwnerStep3.css';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import productCatalogue from '../../../data/productCatalogue';

import OwnerStep3Header from './components/OwnerStep3/OwnerStep3Header';
import OwnerStep3Progress from './components/OwnerStep3/OwnerStep3Progress';
import ShopLocation from './components/OwnerStep3/ShopLocation';
import CatalogueProducts from './components/OwnerStep3/CatalogueProducts';
import CustomProduct from './components/OwnerStep3/CustomProduct';
import AddedProducts from './components/OwnerStep3/AddedProducts';
import OwnerStep3Actions from './components/OwnerStep3/OwnerStep3Actions';

function OwnerStep3() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [shopLocation, setShopLocation] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState(null);

  const [productPrices, setProductPrices] = useState({});

  const [showCustomProduct, setShowCustomProduct] = useState(false);

  const [customProductName, setCustomProductName] = useState('');
  const [customProductCategory, setCustomProductCategory] = useState('');
  const [customProductPrice, setCustomProductPrice] = useState('');
  const [customProductUnit, setCustomProductUnit] = useState('');
  const [customProductImage, setCustomProductImage] = useState('');

  const [error, setError] = useState('');

  // =========================
  // RESTORE REGISTRATION DATA
  // =========================

  useEffect(() => {
    const savedData = sessionStorage.getItem('rma_owner_registration');

    if (!savedData) return;

    try {
      const ownerData = JSON.parse(savedData);

      if (Array.isArray(ownerData.products)) {
        setProducts(ownerData.products);
      }

      if (
        ownerData.location &&
        Number.isFinite(Number(ownerData.location.latitude)) &&
        Number.isFinite(Number(ownerData.location.longitude))
      ) {
        setShopLocation({
          latitude: Number(ownerData.location.latitude),
          longitude: Number(ownerData.location.longitude),
          address: ownerData.location.address || '',
          accuracy: ownerData.location.accuracy ?? null,
        });
      }
    } catch (err) {
      console.error('Failed to restore owner registration data:', err);
    }
  }, []);

  // =========================
  // SELECT CATEGORY
  // =========================

  const handleCategorySelect = (category) => {
    setError('');
    setSelectedCategory(category);
  };

  // =========================
  // CHANGE CATALOGUE PRODUCT PRICE
  // =========================

  const handleProductPriceChange = (productId, price) => {
    setProductPrices((currentPrices) => ({
      ...currentPrices,
      [productId]: price,
    }));
  };

  // =========================
  // ADD CATALOGUE PRODUCT
  // =========================

  const addCatalogueProduct = (catalogueProduct) => {
    setError('');

    const price = productPrices[catalogueProduct.productId];

    if (!price || Number(price) <= 0) {
      setError(`Please enter a price for ${catalogueProduct.name}.`);
      return;
    }

    const alreadyAdded = products.some(
      (product) => product.catalogueProductId === catalogueProduct.productId,
    );

    if (alreadyAdded) {
      setError(`${catalogueProduct.name} is already added.`);
      return;
    }

    if (!selectedCategory?.categoryName) {
      setError('Please select a product category.');
      return;
    }

    const newProduct = {
      productId: `P${Date.now()}`,
      catalogueProductId: catalogueProduct.productId,
      name: catalogueProduct.name,
      category: selectedCategory.categoryName,
      price: Number(price),
      unit: catalogueProduct.unit,
      imageUrl: catalogueProduct.imageUrl,
      available: true,
      isCustom: false,
    };

    setProducts((currentProducts) => [...currentProducts, newProduct]);

    setProductPrices((currentPrices) => {
      const updatedPrices = { ...currentPrices };

      delete updatedPrices[catalogueProduct.productId];

      return updatedPrices;
    });
  };

  // =========================
  // ADD CUSTOM PRODUCT
  // =========================

  const addCustomProduct = () => {
    setError('');

    if (
      !customProductName.trim() ||
      !customProductCategory.trim() ||
      !customProductPrice ||
      !customProductUnit.trim()
    ) {
      setError('Please fill all custom product fields.');
      return;
    }

    if (Number(customProductPrice) <= 0) {
      setError('Product price must be greater than 0.');
      return;
    }

    const newProduct = {
      productId: `CUSTOM_${Date.now()}`,
      catalogueProductId: null,
      name: customProductName.trim(),
      category: customProductCategory.trim(),
      price: Number(customProductPrice),
      unit: customProductUnit.trim(),
      imageUrl: customProductImage.trim(),
      available: true,
      isCustom: true,
    };

    setProducts((currentProducts) => [...currentProducts, newProduct]);

    setCustomProductName('');
    setCustomProductCategory('');
    setCustomProductPrice('');
    setCustomProductUnit('');
    setCustomProductImage('');

    setShowCustomProduct(false);
  };

  // =========================
  // REMOVE PRODUCT
  // =========================

  const removeProduct = (productId) => {
    setProducts((currentProducts) =>
      currentProducts.filter((product) => product.productId !== productId),
    );
  };

  // =========================
  // CONTINUE
  // =========================

  const handleContinue = (event) => {
    event.preventDefault();

    setError('');

    if (products.length === 0) {
      setError('Please add at least one product.');
      return;
    }

    if (!shopLocation) {
      setError('Please select your shop location.');
      return;
    }

    const savedData = sessionStorage.getItem('rma_owner_registration');

    if (!savedData) {
      navigate('/owner/register/step-1');
      return;
    }

    try {
      const ownerData = JSON.parse(savedData);

      const updatedOwnerData = {
        ...ownerData,

        products,

        location: {
          latitude: Number(shopLocation.latitude),
          longitude: Number(shopLocation.longitude),
          address: shopLocation.address || '',
          accuracy: shopLocation.accuracy ?? null,
        },
      };

      sessionStorage.setItem(
        'rma_owner_registration',
        JSON.stringify(updatedOwnerData),
      );

      navigate('/owner/register/step-4');
    } catch (err) {
      console.error('Failed to save owner registration data:', err);

      setError('Unable to save your registration data. Please try again.');
    }
  };

  // =========================
  // BACK
  // =========================

  const handleBack = () => {
    navigate('/owner/register/step-2');
  };

  // =========================
  // RENDER
  // =========================

  return (
    <main className="owner_step">
      <section className="owner_step_card">
        <OwnerStep3Header />

        <OwnerStep3Progress />

        <form className="owner_step_form" onSubmit={handleContinue}>
          <ShopLocation
            shopLocation={shopLocation}
            setShopLocation={setShopLocation}
          />

          <CatalogueProducts
            productCatalogue={productCatalogue}
            selectedCategory={selectedCategory}
            products={products}
            productPrices={productPrices}
            handleCategorySelect={handleCategorySelect}
            handleProductPriceChange={handleProductPriceChange}
            addCatalogueProduct={addCatalogueProduct}
          />

          <CustomProduct
            showCustomProduct={showCustomProduct}
            setShowCustomProduct={setShowCustomProduct}
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
            addCustomProduct={addCustomProduct}
            setError={setError}
          />

          <AddedProducts products={products} removeProduct={removeProduct} />

          <OwnerStep3Actions error={error} handleBack={handleBack} />
        </form>

        {/* FOOTER */}

        <div className="owner_step_footer">
          <p>Already have a shop?</p>

          <button type="button" onClick={() => navigate('/owner/login')}>
            Back to Login
          </button>
        </div>
      </section>
    </main>
  );
}

export default OwnerStep3;
