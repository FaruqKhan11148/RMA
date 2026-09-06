import './OwnerStep1.css';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function OwnerStep1() {
  const navigate = useNavigate();

  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');

  const handleContinue = (e) => {
    e.preventDefault();

    setError('');

    // PASSWORD CHECK
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    // Keep Step 1 data temporarily
    const ownerData = {
      ownerName,
      phone,
      email,
      password,
    };

    sessionStorage.setItem('rma_owner_registration', JSON.stringify(ownerData));

    navigate('/owner/register/step-2');
  };

  return (
    <main className="owner_step">
      <section className="owner_step_card">
        {/* HEADER */}

        <div className="owner_step_header">
          <div className="owner_logo">RMA</div>

          <p className="step_number">STEP 1 OF 4</p>

          <h1>Owner Verification</h1>

          <p>Enter your basic owner information to start creating your shop.</p>
        </div>

        {/* PROGRESS */}

        <div className="registration_progress">
          <div className="progress_item active">
            <span>1</span>
            <p>Owner</p>
          </div>

          <div className="progress_line"></div>

          <div className="progress_item">
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
            <h2>Owner Details</h2>

            <label>
              Owner Name
              <input
                type="text"
                placeholder="Enter your full name"
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
              Email Address
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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

            <label>
              Confirm Password
              <input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </label>
          </section>

          {/* ERROR */}

          {error && <p className="owner_step_error">{error}</p>}

          {/* CONTINUE */}

          <button className="owner_step_button" type="submit">
            Continue
          </button>
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

export default OwnerStep1;
