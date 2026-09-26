import './OwnerStep1.css';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import OwnerStep1Header from './components/OwnerStep1/OwnerStep1Header';
import OwnerStep1Progress from './components/OwnerStep1/OwnerStep1Progress';
import OwnerStep1Form from './components/OwnerStep1/OwnerStep1Form';

function OwnerStep1() {
  const navigate = useNavigate();

  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');

  const handleContinue = (e) => {
    e.preventDefault();

    setError('');

    // PASSWORD CHECK
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    // Keep Step 1 data temporarily
    const ownerData = {
      ownerName,
      phone,
      email,
      password,
    };

    sessionStorage.setItem('rma_owner_registration', JSON.stringify(ownerData));

    navigate('/owner/register/step-2');
  };

  return (
    <main className="owner_step">
      <section className="owner_step_card">
        <OwnerStep1Header />

        <OwnerStep1Progress />

        <OwnerStep1Form
          ownerName={ownerName}
          setOwnerName={setOwnerName}
          phone={phone}
          setPhone={setPhone}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          error={error}
          handleContinue={handleContinue}
          navigate={navigate}
        />
      </section>
    </main>
  );
}

export default OwnerStep1;
