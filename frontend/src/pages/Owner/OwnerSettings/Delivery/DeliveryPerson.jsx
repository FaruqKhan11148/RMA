import './DeliveryPerson.css';

import { useEffect, useState } from 'react';

import DeliveryPersonHeader from './components/DeliveryPerson/DeliveryPersonHeader';
import DeliveryPersonDetails from './components/DeliveryPerson/DeliveryPersonDetails';
import DeliveryPersonEditForm from './components/DeliveryPerson/DeliveryPersonEditForm';
import DeliveryPersonRegisterForm from './components/DeliveryPerson/DeliveryPersonRegisterForm';

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
          'https://rma-backend-bo4a.onrender.com/api/delivery/person',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (response.status === 404) {
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
        'https://rma-backend-bo4a.onrender.com/api/delivery/person/status',
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

      const response = await fetch(
        'https://rma-backend-bo4a.onrender.com/api/delivery/person',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: editName.trim(),
            phone: editPhone.trim(),
          }),
        },
      );

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
        'https://rma-backend-bo4a.onrender.com/api/delivery/register',
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

  const handleEdit = () => {
    setEditName(deliveryPerson.name);
    setEditPhone(deliveryPerson.phone);
    setEditing(true);
    setError('');
    setSuccessMessage('');
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
            <DeliveryPersonHeader registered={true} />

            <div className="delivery_person_result">
              {!editing ? (
                <DeliveryPersonDetails
                  deliveryPerson={deliveryPerson}
                  onEdit={handleEdit}
                  onStatusChange={handleStatusChange}
                  updatingStatus={updatingStatus}
                />
              ) : (
                <DeliveryPersonEditForm
                  editName={editName}
                  setEditName={setEditName}
                  editPhone={editPhone}
                  setEditPhone={setEditPhone}
                  handleUpdateDetails={handleUpdateDetails}
                  updatingDetails={updatingDetails}
                  setEditing={setEditing}
                  setError={setError}
                  setSuccessMessage={setSuccessMessage}
                />
              )}
            </div>
          </>
        ) : (
          <>
            <DeliveryPersonHeader registered={false} />

            <DeliveryPersonRegisterForm
              name={name}
              setName={setName}
              phone={phone}
              setPhone={setPhone}
              handleRegister={handleRegister}
              loading={loading}
              setError={setError}
            />

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
