import './DeliveryPerson.css';

import { useEffect, useState } from 'react';

function DeliveryPerson() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [deliveryPerson, setDeliveryPerson] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [updatingDetails, setUpdatingDetails] = useState(false);
  const [checkingDeliveryPerson, setCheckingDeliveryPerson] = useState(true);

  useEffect(() => {
    const fetchDeliveryPerson = async () => {
      try {
        const token = localStorage.getItem('rma_owner_token');

        if (!token) {
          setError('Owner login session not found');
          return;
        }

        const response = await fetch(
          'http://localhost:5000api/delivery/person',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (response.status === 404) {
          // No delivery person yet.
          setDeliveryPerson(null);
          return;
        }

        if (!response.ok) {
          setError(data.message || 'Unable to load delivery person');
          return;
        }

        setDeliveryPerson(data.deliveryPerson);
      } catch (error) {
        console.error('Fetch delivery person failed:', error);

        setError('Unable to connect to server');
      } finally {
        setCheckingDeliveryPerson(false);
      }
    };

    fetchDeliveryPerson();
  }, []);

  const handleStatusChange = async () => {
    if (!deliveryPerson) return;

    try {
      setUpdatingStatus(true);
      setError('');
      setSuccessMessage('');

      const token = localStorage.getItem('rma_owner_token');

      if (!token) {
        setError('Owner login session not found');
        return;
      }

      const response = await fetch(
        'http://localhost:5000api/delivery/person/status',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            isActive: !deliveryPerson.isActive,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Unable to update delivery person status');
        return;
      }

      setDeliveryPerson(data.deliveryPerson);
      setSuccessMessage(data.message);
    } catch (error) {
      console.error('Update delivery person status failed:', error);

      setError('Unable to connect to server');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleUpdateDetails = async (event) => {
    event.preventDefault();

    setError('');
    setSuccessMessage('');

    if (!editName.trim()) {
      setError('Please enter the delivery person name');
      return;
    }

    if (!editPhone.trim()) {
      setError('Please enter the delivery person phone number');
      return;
    }

    if (editPhone.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    try {
      setUpdatingDetails(true);

      const token = localStorage.getItem('rma_owner_token');

      if (!token) {
        setError('Owner login session not found');
        return;
      }

      const response = await fetch('http://localhost:5000api/delivery/person', {
        method: 'PATCH',

        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          name: editName.trim(),
          phone: editPhone.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Unable to update delivery person details');
        return;
      }

      setDeliveryPerson(data.deliveryPerson);

      setSuccessMessage(data.message);

      setEditing(false);

      setEditName('');
      setEditPhone('');
    } catch (error) {
      console.error('Update delivery person details failed:', error);

      setError('Unable to connect to server');
    } finally {
      setUpdatingDetails(false);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();

    setError('');
    setSuccessMessage('');
    setDeliveryPerson(null);

    if (!name.trim()) {
      setError('Please enter the delivery person name');
      return;
    }

    if (!phone.trim()) {
      setError('Please enter the delivery person phone number');
      return;
    }

    if (phone.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem('rma_owner_token');

      if (!token) {
        setError('Owner login session not found');
        return;
      }

      const response = await fetch(
        'http://localhost:5000api/delivery/register',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            name: name.trim(),
            phone: phone.trim(),
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Unable to register delivery person');
        return;
      }

      setSuccessMessage(data.message);
      setDeliveryPerson(data.deliveryPerson);

      setName('');
      setPhone('');
    } catch (error) {
      console.error('Register delivery person failed:', error);

      setError('Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="delivery_person_settings">
      <section className="delivery_person_card">
        {checkingDeliveryPerson ? (
          <>
            <h1>Delivery Person</h1>

            <p>Checking your delivery person details...</p>
          </>
        ) : deliveryPerson ? (
          <>
            <h1>Delivery Person</h1>

            <p>Your shop already has a delivery person registered.</p>

            <div className="delivery_person_result">
              {!editing ? (
                <>
                  <h2>Delivery Person Details</h2>

                  <p>
                    <strong>Name:</strong> {deliveryPerson.name}
                  </p>

                  <p>
                    <strong>Phone:</strong> {deliveryPerson.phone}
                  </p>

                  <p>
                    <strong>Shop ID:</strong> {deliveryPerson.shopId}
                  </p>

                  <p>
                    <strong>Status:</strong>{' '}
                    {deliveryPerson.isActive ? 'Active' : 'Inactive'}
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setEditName(deliveryPerson.name);
                      setEditPhone(deliveryPerson.phone);
                      setEditing(true);
                      setError('');
                      setSuccessMessage('');
                    }}
                  >
                    Edit Details
                  </button>

                  <button
                    type="button"
                    onClick={handleStatusChange}
                    disabled={updatingStatus}
                  >
                    {updatingStatus
                      ? 'Updating...'
                      : deliveryPerson.isActive
                        ? 'Deactivate Delivery Person'
                        : 'Activate Delivery Person'}
                  </button>
                </>
              ) : (
                <>
                  <h2>Edit Delivery Person</h2>

                  <form onSubmit={handleUpdateDetails}>
                    <div>
                      <label>Delivery Person Name</label>

                      <input
                        type="text"
                        value={editName}
                        placeholder="Enter full name"
                        onChange={(event) => {
                          setEditName(event.target.value);
                          setError('');
                          setSuccessMessage('');
                        }}
                      />
                    </div>

                    <div>
                      <label>Phone Number</label>

                      <input
                        type="tel"
                        inputMode="numeric"
                        maxLength="10"
                        value={editPhone}
                        placeholder="Enter 10-digit phone number"
                        onChange={(event) => {
                          setEditPhone(event.target.value.replace(/\D/g, ''));

                          setError('');
                          setSuccessMessage('');
                        }}
                      />
                    </div>

                    <button type="submit" disabled={updatingDetails}>
                      {updatingDetails ? 'Saving...' : 'Save Changes'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setEditing(false);
                        setEditName('');
                        setEditPhone('');
                        setError('');
                        setSuccessMessage('');
                      }}
                      disabled={updatingDetails}
                    >
                      Cancel
                    </button>
                  </form>
                </>
              )}
            </div>
          </>
        ) : (
          <>
            <h1>Register Delivery Person</h1>

            <p>
              Register a delivery person who will deliver orders for your shop.
            </p>

            <form onSubmit={handleRegister}>
              <div>
                <label>Delivery Person Name</label>

                <input
                  type="text"
                  placeholder="Enter full name"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    setError('');
                  }}
                />
              </div>

              <div>
                <label>Phone Number</label>

                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength="10"
                  placeholder="Enter 10-digit phone number"
                  value={phone}
                  onChange={(event) => {
                    setPhone(event.target.value.replace(/\D/g, ''));
                    setError('');
                  }}
                />
              </div>

              <button type="submit" disabled={loading}>
                {loading ? 'Registering...' : 'Register Delivery Person'}
              </button>
            </form>

            {error && <p className="delivery_person_error">{error}</p>}

            {successMessage && (
              <p className="delivery_person_success">{successMessage}</p>
            )}
          </>
        )}
      </section>
    </main>
  );
}
export default DeliveryPerson;
