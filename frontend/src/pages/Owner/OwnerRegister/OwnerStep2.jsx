import './OwnerStep2.css';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import OwnerStep2Header from './components/OwnerStep2/OwnerStep2Header';
import OwnerStep2Progress from './components/OwnerStep2/OwnerStep2Progress';
import OwnerStep2Form from './components/OwnerStep2/OwnerStep2Form';

function OwnerStep2() {
  const navigate = useNavigate();

  const [shopName, setShopName] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');

  const [delivery, setDelivery] = useState(true);
  const [pickup, setPickup] = useState(true);

  const [error, setError] = useState('');

  const handleContinue = (e) => {
    e.preventDefault();

    setError('');

    if (!delivery && !pickup) {
      setError('Please select at least one order type.');
      return;
    }

    // Get Step 1 data
    const savedData = sessionStorage.getItem('rma_owner_registration');

    if (!savedData) {
      navigate('/owner/register/step-1');
      return;
    }

    const ownerData = JSON.parse(savedData);

    // Add Step 2 data
    const updatedOwnerData = {
      ...ownerData,
      shopName,
      address,
      description,
      delivery,
      pickup,
    };

    // Save everything again
    sessionStorage.setItem(
      'rma_owner_registration',
      JSON.stringify(updatedOwnerData),
    );

    navigate('/owner/register/step-3');
  };

  const handleBack = () => {
    navigate('/owner/register/step-1');
  };

  return (
    <main className="owner_step">
      <section className="owner_step_card">
        <OwnerStep2Header />

        <OwnerStep2Progress />

        <OwnerStep2Form
          shopName={shopName}
          setShopName={setShopName}
          address={address}
          setAddress={setAddress}
          description={description}
          setDescription={setDescription}
          delivery={delivery}
          setDelivery={setDelivery}
          pickup={pickup}
          setPickup={setPickup}
          error={error}
          handleContinue={handleContinue}
          handleBack={handleBack}
          navigate={navigate}
        />
      </section>
    </main>
  );
}

export default OwnerStep2;
