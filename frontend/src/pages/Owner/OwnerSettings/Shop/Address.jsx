import './Address.css';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AddressHeader from './components/Address/AddressHeader';
import AddressForm from './components/Address/AddressForm';

function Address() {
  const navigate = useNavigate();

  const [address, setAddress] = useState('');
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
          throw new Error(data.message || 'Failed to load shop details');
        }

        setAddress(data.owner.address || '');
      } catch (error) {
        console.error('Fetch shop address failed:', error);

        setError(error.message || 'Unable to load shop address.');
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

    const trimmedAddress = address.trim();

    if (!trimmedAddress) {
      setError('Shop address is required.');
      return;
    }

    if (trimmedAddress.length < 5) {
      setError('Shop address must be at least 5 characters long.');
      return;
    }

    if (trimmedAddress.length > 500) {
      setError('Shop address cannot exceed 500 characters.');
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
        'https://rma-backend-bo4a.onrender.com/api/owners/settings/address',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            address: trimmedAddress,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update shop address');
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

      setAddress(data.owner.address || '');

      setSuccess('Shop address updated successfully.');
    } catch (error) {
      console.error('Update shop address failed:', error);

      setError(error.message || 'Unable to update shop address.');
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
        <AddressHeader navigate={navigate} />

        <AddressForm
          address={address}
          setAddress={setAddress}
          error={error}
          success={success}
          saving={saving}
          handleSubmit={handleSubmit}
        />
      </section>
    </main>
  );
}

export default Address;
