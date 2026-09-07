import './SavedAddresses.css';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function SavedAddresses() {
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('https://rma-backend-bo4a.onrender.com/api/customers/addresses', {
      credentials: 'include',
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Unable to fetch addresses');
        }

        return data;
      })
      .then((data) => {
        setAddresses(data.addresses || []);
      })
      .catch((error) => {
        console.error('Fetch addresses failed:', error);
        setError(error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleDelete = async (addressId) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this address?',
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `https://rma-backend-bo4a.onrender.com/api/customers/addresses/${addressId}`,
        {
          method: 'DELETE',
          credentials: 'include',
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to delete address');
      }

      setAddresses(data.addresses || []);
    } catch (error) {
      console.error('Delete address failed:', error);
      alert(error.message);
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      const response = await fetch(
        `https://rma-backend-bo4a.onrender.com/api/customers/addresses/${addressId}/default`,
        {
          method: 'PUT',
          credentials: 'include',
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to set default address');
      }

      setAddresses(data.addresses || []);
    } catch (error) {
      console.error('Set default address failed:', error);

      alert(error.message);
    }
  };

  return (
    <div className="saved_addresses_page">
      <div className="saved_addresses_header">
        <button
          className="saved_addresses_back"
          onClick={() => navigate('/profile')}
        >
          ‹
        </button>

        <h1>Saved Addresses</h1>
      </div>

      {loading && (
        <div className="saved_addresses_loading">Loading addresses...</div>
      )}

      {!loading && error && (
        <div className="saved_addresses_error">{error}</div>
      )}

      {!loading && !error && addresses.length === 0 && (
        <div className="saved_addresses_empty">
          <h2>No saved addresses</h2>

          <p>Add an address to make checkout faster.</p>

          <button onClick={() => navigate('/profile/saved-addresses/add')}>
            Add New Address
          </button>
        </div>
      )}

      {!loading && !error && addresses.length > 0 && (
        <div className="saved_addresses_list">
          {addresses.map((item) => (
            <div className="saved_address_card" key={item._id}>
              <div className="saved_address_card_top">
                <strong>{item.label}</strong>

                {item.isDefault && (
                  <span className="saved_address_default">Default</span>
                )}
              </div>

              <p>{item.address}</p>

              <div className="saved_address_actions">
                <button
                  onClick={() =>
                    navigate(`/profile/saved-addresses/edit/${item._id}`)
                  }
                >
                  Edit
                </button>
                <button onClick={() => handleDelete(item._id)}>Delete</button>

                {!item.isDefault && (
                  <button onClick={() => handleSetDefault(item._id)}>
                    Set Default
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SavedAddresses;
