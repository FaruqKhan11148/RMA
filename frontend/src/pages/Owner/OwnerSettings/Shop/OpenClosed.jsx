import './OpenClosed.css';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import OpenClosedHeader from './components/OpenClosed/OpenClosedHeader';
import ShopStatusCard from './components/OpenClosed/ShopStatusCard';
import ShopStatusOptions from './components/OpenClosed/ShopStatusOptions';
import OpenClosedMessages from './components/OpenClosed/OpenClosedMessages';
import ShopStatusNote from './components/OpenClosed/ShopStatusNote';

function OpenClosed() {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const token = localStorage.getItem('rma_owner_token');

  useEffect(() => {
    if (!token) {
      navigate('/owner/login');
      return;
    }

    let intervalId;

    const fetchOwner = async (showLoading = false) => {
      try {
        if (showLoading) {
          setLoading(true);
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
          throw new Error(data.message || 'Failed to load shop status');
        }

        setIsOpen(Boolean(data.owner.isOpen));

        localStorage.setItem('rma_owner', JSON.stringify(data.owner));

        setError('');
      } catch (error) {
        setError(error.message);
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    };

    fetchOwner(true);

    intervalId = setInterval(() => {
      fetchOwner();
    }, 30000);

    return () => {
      clearInterval(intervalId);
    };
  }, [navigate, token]);

  const handleStatusChange = async (newStatus) => {
    if (newStatus === isOpen) {
      return;
    }

    setError('');
    setSuccessMessage('');
    setSaving(true);

    try {
      const response = await fetch(
        'https://rma-backend-bo4a.onrender.com/api/owners/settings/open-closed',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            isOpen: newStatus,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update shop status');
      }

      setIsOpen(Boolean(data.owner.isOpen));

      localStorage.setItem('rma_owner', JSON.stringify(data.owner));

      setSuccessMessage(data.message);
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="owner_setting_page">
        <div className="owner_setting_card">
          <p className="owner_setting_loading">Loading shop status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="owner_setting_page">
      <div className="owner_setting_card">
        <OpenClosedHeader navigate={navigate} />

        <ShopStatusCard isOpen={isOpen} />

        <ShopStatusOptions
          isOpen={isOpen}
          handleStatusChange={handleStatusChange}
          saving={saving}
        />

        <OpenClosedMessages
          saving={saving}
          error={error}
          successMessage={successMessage}
        />

        <ShopStatusNote />
      </div>
    </div>
  );
}

export default OpenClosed;
