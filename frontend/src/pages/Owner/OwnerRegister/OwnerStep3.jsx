import './OwnerStep3.css';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function OwnerStep3() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);

  const [productName, setProductName] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productUnit, setProductUnit] = useState('');

  const [error, setError] = useState('');

  const addProduct = () => {
    setError('');

    if (
      !productName.trim() ||
      !productCategory.trim() ||
      !productPrice ||
      !productUnit.trim()
    ) {
      setError('Please fill all product fields.');
      return;
    }

    if (Number(productPrice) <= 0) {
      setError('Product price must be greater than 0.');
      return;
    }

    const newProduct = {
      productId: `P${Date.now()}`,
      name: productName.trim(),
      category: productCategory.trim(),
      price: Number(productPrice),
      unit: productUnit.trim(),
      available: true,
    };

    setProducts((currentProducts) => [...currentProducts, newProduct]);

    setProductName('');
    setProductCategory('');
    setProductPrice('');
    setProductUnit('');
  };

  const removeProduct = (productId) => {
    setProducts((currentProducts) =>
      currentProducts.filter((product) => product.productId !== productId),
    );
  };

  const handleContinue = (e) => {
    e.preventDefault();

    setError('');

    if (products.length === 0) {
      setError('Please add at least one product.');
      return;
    }

    // Get Step 1 + Step 2 data
    const savedData = sessionStorage.getItem('rma_owner_registration');

    if (!savedData) {
      navigate('/owner/register/step-1');
      return;
    }

    const ownerData = JSON.parse(savedData);

    // Add Step 3 data
    const updatedOwnerData = {
      ...ownerData,
      products,
    };

    // Save everything
    sessionStorage.setItem(
      'rma_owner_registration',
      JSON.stringify(updatedOwnerData),
    );

    navigate('/owner/register/step-4');
  };

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

          <p>Add the products customers can order from your shop.</p>
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
          <section className="register_section">
            <h2>Add Products</h2>

            <p className="section_description">
              Add the products and prices available in your shop.
            </p>

            {/* PRODUCT FORM */}

            <div className="product_form">
              <label>
                Product Name
                <input
                  type="text"
                  placeholder="Example: Chicken Breast"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                />
              </label>

              <label>
                Category
                <input
                  type="text"
                  placeholder="Example: Chicken"
                  value={productCategory}
                  onChange={(e) => setProductCategory(e.target.value)}
                />
              </label>

              <label>
                Price
                <input
                  type="number"
                  placeholder="Example: 250"
                  value={productPrice}
                  onChange={(e) => setProductPrice(e.target.value)}
                  min="1"
                />
              </label>

              <label>
                Unit
                <input
                  type="text"
                  placeholder="Example: kg"
                  value={productUnit}
                  onChange={(e) => setProductUnit(e.target.value)}
                />
              </label>
            </div>

            <button
              type="button"
              className="add_product_button"
              onClick={addProduct}
            >
              + Add Product
            </button>
          </section>

          {/* PRODUCT LIST */}

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
