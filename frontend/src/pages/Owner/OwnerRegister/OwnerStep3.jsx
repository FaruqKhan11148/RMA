import './OwnerStep3.css';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import productCatalogue from '../../../data/productCatalogue';

function OwnerStep3() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState(null);

  const [productPrices, setProductPrices] = useState({});

  const [showCustomProduct, setShowCustomProduct] = useState(false);

  const [customProductName, setCustomProductName] = useState('');
  const [customProductCategory, setCustomProductCategory] = useState('');
  const [customProductPrice, setCustomProductPrice] = useState('');
  const [customProductUnit, setCustomProductUnit] = useState('');
  const [customProductImage, setCustomProductImage] = useState('');

  const [error, setError] = useState('');

  // SELECT CATEGORY
  const handleCategorySelect = (category) => {
    setError('');
    setSelectedCategory(category);
  };

  // CHANGE CATALOGUE PRODUCT PRICE
  const handleProductPriceChange = (productId, price) => {
    setProductPrices((currentPrices) => ({
      ...currentPrices,
      [productId]: price,
    }));
  };

  // ADD CATALOGUE PRODUCT
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

  // ADD CUSTOM PRODUCT
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

  // REMOVE PRODUCT
  const removeProduct = (productId) => {
    setProducts((currentProducts) =>
      currentProducts.filter((product) => product.productId !== productId),
    );
  };

  // CONTINUE
  const handleContinue = (event) => {
    event.preventDefault();

    setError('');

    if (products.length === 0) {
      setError('Please add at least one product.');
      return;
    }

    const savedData = sessionStorage.getItem('rma_owner_registration');

    if (!savedData) {
      navigate('/owner/register/step-1');
      return;
    }

    const ownerData = JSON.parse(savedData);

    const updatedOwnerData = {
      ...ownerData,
      products,
    };

    sessionStorage.setItem(
      'rma_owner_registration',
      JSON.stringify(updatedOwnerData),
    );

    navigate('/owner/register/step-4');
  };

  // BACK
  const handleBack = () => {
    navigate('/owner/register/step-2');
  };

  return (
    <main className="owner_step">
      <section className="owner_step_card">
        {/* HEADER */}

        <div className="owner_step_header">
          <div className="owner_logo">RMA</div>

          <p className="step_number">STEP 3 OF 4</p>

          <h1>Product Verification</h1>

          <p>Choose the products available in your shop.</p>
        </div>

        {/* PROGRESS */}

        <div className="registration_progress">
          <div className="progress_item completed">
            <span>✓</span>
            <p>Owner</p>
          </div>

          <div className="progress_line active"></div>

          <div className="progress_item completed">
            <span>✓</span>
            <p>Shop</p>
          </div>

          <div className="progress_line active"></div>

          <div className="progress_item active">
            <span>3</span>
            <p>Products</p>
          </div>

          <div className="progress_line"></div>

          <div className="progress_item">
            <span>4</span>
            <p>Payment</p>
          </div>
        </div>

        {/* FORM */}

        <form className="owner_step_form" onSubmit={handleContinue}>
          {/* RMA CATALOGUE */}

          <section className="register_section">
            <h2>RMA Product Catalogue</h2>

            <p className="section_description">
              Select products from the RMA catalogue and set your shop price.
            </p>

            {/* CATEGORIES */}

            <div className="catalogue_categories">
              {productCatalogue.map((category) => (
                <button
                  type="button"
                  key={category.categoryId}
                  className={
                    selectedCategory?.categoryId === category.categoryId
                      ? 'catalogue_category active'
                      : 'catalogue_category'
                  }
                  onClick={() => handleCategorySelect(category)}
                >
                  {category.categoryName}
                </button>
              ))}
            </div>

            {/* PRODUCTS */}

            {selectedCategory && (
              <div className="catalogue_products">
                <h3>{selectedCategory.categoryName}</h3>

                <div className="catalogue_product_grid">
                  {selectedCategory.products.map((product) => {
                    const alreadyAdded = products.some(
                      (item) => item.catalogueProductId === product.productId,
                    );

                    return (
                      <div
                        className="catalogue_product_card"
                        key={product.productId}
                      >
                        <img src={product.imageUrl} alt={product.name} />

                        <div className="catalogue_product_info">
                          <h4>{product.name}</h4>

                          <p>Unit: {product.unit}</p>

                          <input
                            type="number"
                            min="1"
                            placeholder="Enter price"
                            value={productPrices[product.productId] || ''}
                            onChange={(event) =>
                              handleProductPriceChange(
                                product.productId,
                                event.target.value,
                              )
                            }
                            disabled={alreadyAdded}
                          />

                          <button
                            type="button"
                            className="add_product_button"
                            onClick={() => addCatalogueProduct(product)}
                            disabled={alreadyAdded}
                          >
                            {alreadyAdded ? 'Added' : '+ Add Product'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>

          {/* CUSTOM PRODUCT */}

          <section className="register_section">
            <h2>Custom Product</h2>

            <p className="section_description">
              Can't find your product in the RMA catalogue?
            </p>

            {!showCustomProduct ? (
              <button
                type="button"
                className="add_product_button"
                onClick={() => {
                  setShowCustomProduct(true);
                  setError('');
                }}
              >
                + Add Custom Product
              </button>
            ) : (
              <div className="product_form">
                <label>
                  Product Name
                  <input
                    type="text"
                    placeholder="Example: Country Chicken"
                    value={customProductName}
                    onChange={(event) =>
                      setCustomProductName(event.target.value)
                    }
                  />
                </label>

                <label>
                  Category
                  <input
                    type="text"
                    placeholder="Example: Chicken"
                    value={customProductCategory}
                    onChange={(event) =>
                      setCustomProductCategory(event.target.value)
                    }
                  />
                </label>

                <label>
                  Price
                  <input
                    type="number"
                    min="1"
                    placeholder="Example: 450"
                    value={customProductPrice}
                    onChange={(event) =>
                      setCustomProductPrice(event.target.value)
                    }
                  />
                </label>

                <label>
                  Unit
                  <input
                    type="text"
                    placeholder="Example: KG"
                    value={customProductUnit}
                    onChange={(event) =>
                      setCustomProductUnit(event.target.value)
                    }
                  />
                </label>

                <label>
                  Image URL
                  <input
                    type="text"
                    placeholder="Temporary image URL"
                    value={customProductImage}
                    onChange={(event) =>
                      setCustomProductImage(event.target.value)
                    }
                  />
                </label>

                <button
                  type="button"
                  className="add_product_button"
                  onClick={addCustomProduct}
                >
                  + Add Custom Product
                </button>
              </div>
            )}
          </section>

          {/* ADDED PRODUCTS */}

          {products.length > 0 && (
            <section className="register_section">
              <h2>Added Products ({products.length})</h2>

              <div className="registered_products">
                {products.map((product) => (
                  <div className="registered_product" key={product.productId}>
                    <div>
                      <strong>{product.name}</strong>

                      <span>
                        {product.category} • ₹{product.price} / {product.unit}
                      </span>

                      <small>
                        {product.isCustom ? 'Custom Product' : 'RMA Catalogue'}
                      </small>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeProduct(product.productId)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ERROR */}

          {error && <p className="owner_step_error">{error}</p>}

          {/* ACTIONS */}

          <div className="owner_step_actions">
            <button
              type="button"
              className="owner_step_back_button"
              onClick={handleBack}
            >
              Back
            </button>

            <button className="owner_step_button" type="submit">
              Continue
            </button>
          </div>
        </form>

        {/* FOOTER */}

        <div className="owner_step_footer">
          <p>Already have a shop?</p>

          <button onClick={() => navigate('/owner/login')}>
            Back to Login
          </button>
        </div>
      </section>
    </main>
  );
}

export default OwnerStep3;
