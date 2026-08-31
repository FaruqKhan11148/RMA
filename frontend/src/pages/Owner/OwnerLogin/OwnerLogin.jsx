import './OwnerLogin.css';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function OwnerLogin() {
  const navigate = useNavigate();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/owners/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Login failed');
        return;
      }

      console.log('Owner Login:', data);

      localStorage.setItem('rma_owner', JSON.stringify(data.owner));

      navigate('/owner/dashboard');
    } catch (error) {
      console.error('Login error:', error);

      setError('Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="owner_login">
      <section className="owner_login_card">
        <div className="owner_login_header">
          <div className="owner_logo">RMA</div>

          <h1>Owner Login</h1>

          <p>Login to manage your shop and orders.</p>
        </div>

        <form className="owner_login_form" onSubmit={handleSubmit}>
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
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          {error && <p className="owner_login_error">{error}</p>}

          <button
            className="owner_login_button"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="owner_login_footer">
          <p>Are you a customer?</p>

          <button onClick={() => navigate('/')}>Back to Home</button>
        </div>
      </section>
    </main>
  );
}

export default OwnerLogin;
