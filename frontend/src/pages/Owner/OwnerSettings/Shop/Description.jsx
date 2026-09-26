import './Description.css';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import DescriptionHeader from './components/Description/DescriptionHeader';
import DescriptionForm from './components/Description/DescriptionForm';

function Description() {
  const navigate = useNavigate();

  const [description, setDescription] = useState('');
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

        setDescription(data.owner.description || '');
      } catch (error) {
        console.error('Fetch shop description failed:', error);

        setError(error.message || 'Unable to load shop description.');
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

    const trimmedDescription = description.trim();

    if (trimmedDescription.length > 500) {
      setError('Description cannot exceed 500 characters.');
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
        'https://rma-backend-bo4a.onrender.com/api/owners/settings/description',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            description: trimmedDescription,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update shop description');
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

      setDescription(data.owner.description || '');

      setSuccess('Shop description updated successfully.');
    } catch (error) {
      console.error('Update shop description failed:', error);

      setError(error.message || 'Unable to update shop description.');
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
        <DescriptionHeader navigate={navigate} />

        <DescriptionForm
          description={description}
          setDescription={setDescription}
          error={error}
          success={success}
          saving={saving}
          handleSubmit={handleSubmit}
        />
      </section>
    </main>
  );
}

export default Description;
