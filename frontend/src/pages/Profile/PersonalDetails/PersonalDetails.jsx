import './PersonalDetails.css';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function PersonalDetails() {
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const response = await fetch(
          'https://rma-backend-bo4a.onrender.com/api/customers/me',
          {
            credentials: 'include',
          },
        );

        if (!response.ok) {
          navigate('/customer/login');
          return;
        }

        const data = await response.json();

        const currentCustomer = data.customer;

        setCustomer(currentCustomer);

        setName(currentCustomer?.name || '');
        setPhone(currentCustomer?.phone || '');
        setEmail(currentCustomer?.email || '');
      } catch (error) {
        console.error('Fetch customer details failed:', error);
        setError('Unable to load your details.');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [navigate]);

  const handleSave = async (e) => {
    e.preventDefault();

    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError('Name is required.');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        'https://rma-backend-bo4a.onrender.com/api/customers/me',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            name: name.trim(),
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      setCustomer(data.customer);
      setName(data.customer.name);
      setPhone(data.customer.phone);
      setEmail(data.customer.email);

      setSuccess('Details updated successfully.');
    } catch (error) {
      console.error('Update customer details failed:', error);
      setError('Unable to update your details.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="personal_details">
        <section className="personal_details_loading">
          <div className="personal_details_spinner" />
          <p>Loading your details...</p>
        </section>
      </main>
    );
  }

  if (!customer) {
    return null;
  }

  return (
    <main className="personal_details">
      <header className="personal_details_header">
        <button
          className="personal_details_back"
          onClick={() => navigate('/profile')}
        >
          ←
        </button>

        <div>
          <h1>Personal Details</h1>
          <p>Manage your account information</p>
        </div>
      </header>

      <form className="personal_details_card" onSubmit={handleSave}>
        <div className="personal_details_avatar">
          {name ? name.charAt(0).toUpperCase() : 'R'}
        </div>

        <div className="personal_details_field">
          <label htmlFor="customer-name">Full Name</label>

          <input
            id="customer-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
          />
        </div>

        <div className="personal_details_field">
          <label htmlFor="customer-phone">Mobile Number</label>

          <input id="customer-phone" type="tel" value={phone} readOnly />

          <small>Phone number cannot be changed here.</small>
        </div>

        <div className="personal_details_field">
          <label htmlFor="customer-email">Email</label>

          <input id="customer-email" type="email" value={email} readOnly />

          <small>Email cannot be changed here.</small>
        </div>

        {error && <div className="personal_details_message error">{error}</div>}

        {success && (
          <div className="personal_details_message success">{success}</div>
        )}

        <button
          type="submit"
          className="personal_details_save"
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </main>
  );
}

export default PersonalDetails;
