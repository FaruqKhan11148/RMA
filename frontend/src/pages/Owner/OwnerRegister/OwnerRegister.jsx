import './OwnerRegister.css';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function OwnerRegister() {
  const navigate = useNavigate();

  const [ownerName, setOwnerName] = useState('');
  const [shopName, setShopName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');

  const [delivery, setDelivery] = useState(true);
  const [pickup, setPickup] = useState(true);

  const [products, setProducts] = useState([]);

  const [productName, setProductName] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productUnit, setProductUnit] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const addProduct = () => {
    if (!productName || !productCategory || !productPrice || !productUnit) {
      setError('Please fill all product fields.');
      return;
    }

    const newProduct = {
      productId: `P${Date.now()}`,
      name: productName,
      category: productCategory,
      price: Number(productPrice),
      unit: productUnit,
      available: true,
    };

    setProducts((currentProducts) => [...currentProducts, newProduct]);

    setProductName('');
    setProductCategory('');
    setProductPrice('');
    setProductUnit('');

    setError('');
  };

  const removeProduct = (productId) => {
    setProducts((currentProducts) =>
      currentProducts.filter((product) => product.productId !== productId),
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');

    if (!delivery && !pickup) {
      setError('Please select at least one order type.');
      return;
    }

    if (products.length === 0) {
      setError('Please add at least one product.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        'https://rma-backend-bo4a.onrender.com/api/owners/register',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
            ownerName,
            shopName,
            phone,
            password,
            address,
            description,
            delivery,
            pickup,
            products,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Registration failed.');
        return;
      }

      console.log('Owner Registration:', data);

      navigate('/owner/shop-created', {
        state: {
          owner: data.owner,
        },
      });
    } catch (error) {
      console.error('Owner registration failed:', error);

      setError('Unable to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="owner_register">
      <section className="owner_register_card">
        {/* HEADER */}

        <div className="owner_register_header">
          <div className="owner_logo">RMA</div>

          <h1>Create Your Shop</h1>

          <p>Register your shop and start receiving customer orders.</p>
        </div>

        <form className="owner_register_form" onSubmit={handleSubmit}>
          {/* OWNER DETAILS */}

          <section className="register_section">
            <h2>Owner Details</h2>

            <label>
              Owner Name
              <input
                type="text"
                placeholder="Enter owner name"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                required
              />
            </label>

            <label>
              Mobile Number
              <input
                type="tel"
                placeholder="Enter mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                placeholder="Create password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
          </section>

          {/* SHOP DETAILS */}

          <section className="register_section">
            <h2>Shop Details</h2>

            <label>
              Shop Name
              <input
                type="text"
                placeholder="Enter shop name"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                required
              />
            </label>

            <label>
              Shop Address
              <textarea
                placeholder="Enter complete shop address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </label>

            <label>
              Shop Description
              <textarea
                placeholder="Example: Fresh chicken, fish and seafood"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>
          </section>

          {/* ORDER OPTIONS */}

          <section className="register_section">
            <h2>Order Options</h2>

            <label className="checkbox_label">
              <input
                type="checkbox"
                checked={delivery}
                onChange={(e) => setDelivery(e.target.checked)}
              />
              Delivery Available
            </label>

            <label className="checkbox_label">
              <input
                type="checkbox"
                checked={pickup}
                onChange={(e) => setPickup(e.target.checked)}
              />
              Pickup Available
            </label>
          </section>

          {/* PRODUCTS */}

          <section className="register_section">
            <h2>Products</h2>

            <p className="section_description">
              Add the products customers can order from your shop.
            </p>

            <div className="product_form">
              <input
                type="text"
                placeholder="Product name"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />

              <input
                type="text"
                placeholder="Category"
                value={productCategory}
                onChange={(e) => setProductCategory(e.target.value)}
              />

              <input
                type="number"
                placeholder="Price"
                value={productPrice}
                onChange={(e) => setProductPrice(e.target.value)}
                min="0"
              />

              <input
                type="text"
                placeholder="Unit (kg, piece, etc.)"
                value={productUnit}
                onChange={(e) => setProductUnit(e.target.value)}
              />

              <button type="button" onClick={addProduct}>
                Add Product
              </button>
            </div>

            {/* PRODUCT LIST */}

            {products.length > 0 && (
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
            )}
          </section>

          {/* ERROR */}

          {error && <p className="owner_register_error">{error}</p>}

          {/* SUBMIT */}

          <button
            className="owner_register_button"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Creating Shop...' : 'Continue'}
          </button>
        </form>

        {/* FOOTER */}

        <div className="owner_register_footer">
          <p>Already have a shop?</p>

          <button onClick={() => navigate('/owner/login')}>
            Back to Login
          </button>
        </div>
      </section>
    </main>
  );
}

export default OwnerRegister;
