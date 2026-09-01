import './OwnerStep2.css';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function OwnerStep2() {
  const navigate = useNavigate();

  const [shopName, setShopName] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');

  const [delivery, setDelivery] = useState(true);
  const [pickup, setPickup] = useState(true);

  const [error, setError] = useState('');

  const handleContinue = (e) => {
    e.preventDefault();

    setError('');

    if (!delivery && !pickup) {
      setError('Please select at least one order type.');
      return;
    }

    // Get Step 1 data
    const savedData = sessionStorage.getItem('rma_owner_registration');

    if (!savedData) {
      navigate('/owner/register/step-1');
      return;
    }

    const ownerData = JSON.parse(savedData);

    // Add Step 2 data
    const updatedOwnerData = {
      ...ownerData,
      shopName,
      address,
      description,
      delivery,
      pickup,
    };

    // Save everything again
    sessionStorage.setItem(
      'rma_owner_registration',
      JSON.stringify(updatedOwnerData),
    );

    navigate('/owner/register/step-3');
  };

  const handleBack = () => {
    navigate('/owner/register/step-1');
  };

  return (
    <main className="owner_step">
      <section className="owner_step_card">
        {/* HEADER */}

        <div className="owner_step_header">
          <div className="owner_logo">RMA</div>

          <p className="step_number">STEP 2 OF 4</p>

          <h1>Shop Verification</h1>

          <p>
            Enter your shop information so customers can find and order from
            your shop.
          </p>
        </div>

        {/* PROGRESS */}

        <div className="registration_progress">
          <div className="progress_item completed">
            <span>✓</span>
            <p>Owner</p>
          </div>

          <div className="progress_line active"></div>

          <div className="progress_item active">
            <span>2</span>
            <p>Shop</p>
          </div>

          <div className="progress_line"></div>

          <div className="progress_item">
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
            <h2>Shop Details</h2>

            <label>
              Shop Name
              <input
                type="text"
                placeholder="Enter your shop name"
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

            <p className="section_description">
              Select how customers can receive their orders.
            </p>

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

export default OwnerStep2;
