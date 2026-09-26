import './PersonalDetails.css';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import PersonalDetailsHeader from './components/PersonalDetailsHeader';
import PersonalDetailsLoading from './components/PersonalDetailsLoading';
import PersonalDetailsField from './components/PersonalDetailsField';
import PersonalDetailsSave from './components/PersonalDetailsSave';

import {
  fetchCustomerDetails,
  updateCustomerDetails,
} from './utils/personalDetailsApi';

function PersonalDetails() {
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const currentCustomer = await fetchCustomerDetails();

        if (!currentCustomer) {
          navigate('/customer/login');
          return;
        }

        setCustomer(currentCustomer);

        setName(currentCustomer?.name || '');
        setPhone(currentCustomer?.phone || '');
        setEmail(currentCustomer?.email || '');
      } catch (error) {
        console.error('Fetch customer details failed:', error);
        setError('Unable to load your details.');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [navigate]);

  const handleSave = async (e) => {
    e.preventDefault();

    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError('Name is required.');
      return;
    }

    setSaving(true);

    try {
      const updatedCustomer = await updateCustomerDetails(name);

      setCustomer(updatedCustomer);
      setName(updatedCustomer.name);
      setPhone(updatedCustomer.phone);
      setEmail(updatedCustomer.email);

      setSuccess('Details updated successfully.');
    } catch (error) {
      console.error('Update customer details failed:', error);
      setError('Unable to update your details.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <PersonalDetailsLoading />;
  }

  if (!customer) {
    return null;
  }

  return (
    <main className="personal_details">
      <PersonalDetailsHeader navigate={navigate} />

      <form className="personal_details_card" onSubmit={handleSave}>
        <div className="personal_details_avatar">
          {name ? name.charAt(0).toUpperCase() : 'R'}
        </div>

        <PersonalDetailsField
          id="customer-name"
          label="Full Name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
        />

        <PersonalDetailsField
          id="customer-phone"
          label="Mobile Number"
          type="tel"
          value={phone}
          readOnly
          helperText="Phone number cannot be changed here."
        />

        <PersonalDetailsField
          id="customer-email"
          label="Email"
          type="email"
          value={email}
          readOnly
          helperText="Email cannot be changed here."
        />

        {error && <div className="personal_details_message error">{error}</div>}

        {success && (
          <div className="personal_details_message success">{success}</div>
        )}

        <PersonalDetailsSave saving={saving} />
      </form>
    </main>
  );
}

export default PersonalDetails;
