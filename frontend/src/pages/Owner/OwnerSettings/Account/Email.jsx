import './Email.css';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Email() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchOwner = async () => {
      try {
        const token = localStorage.getItem('rma_owner_token');

        if (!token) {
          navigate('/owner/login');
          return;
        }

        const response = await fetch(
          'https://rma-backend-bo4a.onrender.com/api/owners/me',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to load owner details');
        }

        setEmail(data.owner.email);
      } catch (error) {
        console.error('Fetch owner details failed:', error);

        setError(error.message || 'Unable to load owner details.');
      } finally {
        setLoading(false);
      }
    };

    fetchOwner();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setSuccess('');

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      setError('Email is required.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      setSaving(true);

      const token = localStorage.getItem('rma_owner_token');

      if (!token) {
        navigate('/owner/login');
        return;
      }

      const response = await fetch(
        'https://rma-backend-bo4a.onrender.com/api/owners/settings/email',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: trimmedEmail,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update email');
      }

      const savedOwner = localStorage.getItem('rma_owner');

      if (savedOwner) {
        const currentOwner = JSON.parse(savedOwner);

        localStorage.setItem(
          'rma_owner',
          JSON.stringify({
            ...currentOwner,
            ...data.owner,
          }),
        );
      }

      setEmail(data.owner.email);

      setSuccess('Email address updated successfully.');
    } catch (error) {
      console.error('Update email failed:', error);

      setError(error.message || 'Unable to update email address.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="owner_setting_page">
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <main className="owner_setting_page">
      <section className="owner_setting_card">
        <button
          type="button"
          className="owner_setting_back"
          onClick={() => navigate('/owner/settings/account')}
        >
          ← Account Settings
        </button>

        <div className="owner_setting_header">
          <h1>Email Address</h1>

          <p>
            Update the email address associated with your RMA owner account.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="owner_setting_label">
            Email Address
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              autoComplete="email"
              required
            />
          </label>

          {error && <p className="owner_setting_error">{error}</p>}

          {success && <p className="owner_setting_success">{success}</p>}

          <button
            type="submit"
            className="owner_setting_save"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </section>
    </main>
  );
}

export default Email;
