import './OwnerName.css';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import OwnerNameHeader from './components/OwnerName/OwnerNameHeader';
import OwnerNameForm from './components/OwnerName/OwnerNameForm';

function OwnerName() {
  const navigate = useNavigate();

  const [ownerName, setOwnerName] = useState('');
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

        setOwnerName(data.owner.ownerName);
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

    const trimmedName = ownerName.trim();

    if (!trimmedName) {
      setError('Owner name is required.');
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
        'https://rma-backend-bo4a.onrender.com/api/owners/settings/owner-name',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ownerName: trimmedName,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update owner name');
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

      setOwnerName(data.owner.ownerName);
      setSuccess('Owner name updated successfully.');
    } catch (error) {
      console.error('Update owner name failed:', error);
      setError(error.message || 'Unable to update owner name.');
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

        <OwnerNameHeader />

        <OwnerNameForm
          ownerName={ownerName}
          setOwnerName={setOwnerName}
          handleSubmit={handleSubmit}
          error={error}
          success={success}
          saving={saving}
        />
      </section>
    </main>
  );
}

export default OwnerName;
