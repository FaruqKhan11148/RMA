import './PhoneNumber.css';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function PhoneNumber() {
  const navigate = useNavigate();

  const [phone, setPhone] = useState('');
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

        setPhone(data.owner.phone);
      } catch (error) {
        console.error('Fetch owner details failed:', error);
        setError(error.message || 'Unable to load owner details');
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

    const trimmedPhone = phone.trim();

    if (!trimmedPhone) {
      setError('Phone number is required.');
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
        'https://rma-backend-bo4a.onrender.com/api/owners/settings/phone',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            phone: trimmedPhone,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update phone number');
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

      setPhone(data.owner.phone);
      setSuccess('Phone number updated successfully.');
    } catch (error) {
      console.error('Update phone number failed:', error);
      setError(error.message || 'Unable to update phone number.');
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
          <h1>Phone Number</h1>

          <p>
            Update the mobile number associated with your RMA owner account.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="owner_setting_label">
            Mobile Number
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter mobile number"
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

export default PhoneNumber;
