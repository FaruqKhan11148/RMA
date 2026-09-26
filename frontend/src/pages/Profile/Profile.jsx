import './Profile.css';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

import ProfileLoading from './components/ProfileLoading';
import CustomerProfile from './components/CustomerProfile';
import OwnerProfile from './components/OwnerProfile';
import DeliveryProfile from './components/DeliveryProfile';
import GuestProfile from './components/GuestProfile';
import LoginSheet from './components/LoginSheet';
import GuestDeliveryLoginSheet from './components/GuestDeliveryLoginSheet';

function Profile({ onRoleChange }) {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [customer, setCustomer] = useState(null);
  const [owner, setOwner] = useState(null);
  const [deliveryPerson, setDeliveryPerson] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loginSheetOpen, setLoginSheetOpen] = useState(false);
  const [switchRole, setSwitchRole] = useState(null);
  const [switchingRole, setSwitchingRole] = useState(false);
  const [deliveryLoginTypeSheetOpen, setDeliveryLoginTypeSheetOpen] =
    useState(false);

  const handleDeliveryRmaLogin = async () => {
    if (customer) {
      try {
        await fetch(
          'https://rma-backend-bo4a.onrender.com/api/customers/logout',
          {
            method: 'POST',
            credentials: 'include',
          },
        );
      } catch (error) {
        console.error('Customer logout failed:', error);
      }

      setCustomer(null);
    }

    if (owner) {
      localStorage.removeItem('rma_owner');
      localStorage.removeItem('rma_owner_token');
      setOwner(null);
    }

    setDeliveryLoginTypeSheetOpen(false);
    navigate('/delivery/rma-login');
  };

  const handleShopDeliveryLogin = async () => {
    if (customer) {
      try {
        await fetch(
          'https://rma-backend-bo4a.onrender.com/api/customers/logout',
          {
            method: 'POST',
            credentials: 'include',
          },
        );
      } catch (error) {
        console.error('Customer logout failed:', error);
      }

      setCustomer(null);
    }

    if (owner) {
      localStorage.removeItem('rma_owner');
      localStorage.removeItem('rma_owner_token');
      setOwner(null);
    }

    setDeliveryLoginTypeSheetOpen(false);
    navigate('/delivery/orders-delivery');
  };

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const response = await fetch(
          'https://rma-backend-bo4a.onrender.com/api/customers/me',
          {
            credentials: 'include',
          },
        );

        if (!response.ok) {
          setCustomer(null);
          return;
        }

        const data = await response.json();

        setCustomer(data.customer);
      } catch (error) {
        console.error('Fetch customer profile failed:', error);
        setCustomer(null);
      } finally {
        setLoading(false);
      }
    };

    const checkOtherRoles = () => {
      const storedOwner = localStorage.getItem('rma_owner');

      if (storedOwner) {
        try {
          setOwner(JSON.parse(storedOwner));
        } catch (error) {
          console.error('Invalid owner session:', error);
          localStorage.removeItem('rma_owner');
          localStorage.removeItem('rma_owner_token');
        }
      }

      const deliveryToken = sessionStorage.getItem('delivery_token');
      const storedDeliveryPerson = sessionStorage.getItem('delivery_person');

      if (deliveryToken && storedDeliveryPerson) {
        try {
          setDeliveryPerson(JSON.parse(storedDeliveryPerson));
        } catch (error) {
          console.error('Invalid delivery session:', error);
          sessionStorage.removeItem('delivery_token');
          sessionStorage.removeItem('delivery_person');
        }
      }
    };

    fetchCustomer();
    checkOtherRoles();
  }, []);

  useEffect(() => {
    if (owner) {
      onRoleChange?.('owner');
    } else if (deliveryPerson) {
      onRoleChange?.('delivery');
    } else if (customer) {
      onRoleChange?.('customer');
    } else if (!loading) {
      onRoleChange?.('guest');
    }
  }, [customer, owner, deliveryPerson, loading, onRoleChange]);

  const handleLogout = async () => {
    try {
      const response = await fetch(
        'https://rma-backend-bo4a.onrender.com/api/customers/logout',
        {
          method: 'POST',
          credentials: 'include',
        },
      );

      if (!response.ok) {
        throw new Error('Logout failed');
      }

      setCustomer(null);

      navigate('/');
    } catch (error) {
      console.error('Customer logout failed:', error);
    }
  };

  const handleRoleSwitch = async () => {
    if (!switchRole) {
      return;
    }

    try {
      setSwitchingRole(true);

      let response;

      // CUSTOMER → another role
      if (customer) {
        response = await fetch(
          'https://rma-backend-bo4a.onrender.com/api/customers/logout',
          {
            method: 'POST',
            credentials: 'include',
          },
        );
      }

      // OWNER → another role
      if (owner) {
        const token = localStorage.getItem('rma_owner_token');

        response = await fetch(
          'https://rma-backend-bo4a.onrender.com/api/owners/logout',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
      }

      // DELIVERY PARTNER → another role
      if (deliveryPerson) {
        const token = sessionStorage.getItem('delivery_token');

        response = await fetch(
          'https://rma-backend-bo4a.onrender.com/api/delivery/logout',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
      }

      if (!response || !response.ok) {
        throw new Error('Unable to switch account');
      }

      // Clear current role's frontend session
      if (customer) {
        setCustomer(null);
      }

      if (owner) {
        localStorage.removeItem('rma_owner');
        localStorage.removeItem('rma_owner_token');
        setOwner(null);
      }

      if (deliveryPerson) {
        sessionStorage.removeItem('delivery_token');
        sessionStorage.removeItem('delivery_person');
        setDeliveryPerson(null);
      }

      setSwitchRole(null);
      setSwitchingRole(false);

      // Navigate to selected role
      if (switchRole === 'customer') {
        navigate('/customer/login');
        return;
      }

      if (switchRole === 'owner') {
        navigate('/owner/login');
        return;
      }

      if (switchRole === 'delivery') {
        navigate('/delivery/orders-delivery');
      }
    } catch (error) {
      console.error('Role switch failed:', error);
      setSwitchingRole(false);
    }
  };

  const handleOwnerLogout = async () => {
    try {
      const token = localStorage.getItem('rma_owner_token');

      const response = await fetch(
        'https://rma-backend-bo4a.onrender.com/api/owners/logout',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error('Owner logout failed');
      }

      localStorage.removeItem('rma_owner');
      localStorage.removeItem('rma_owner_token');

      setOwner(null);

      navigate('/');
    } catch (error) {
      console.error('Owner logout failed:', error);
    }
  };

  const handleDeliveryLogout = async () => {
    try {
      const token = sessionStorage.getItem('delivery_token');

      const response = await fetch(
        'https://rma-backend-bo4a.onrender.com/api/delivery/logout',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error('Delivery partner logout failed');
      }

      sessionStorage.removeItem('delivery_token');
      sessionStorage.removeItem('delivery_person');

      setDeliveryPerson(null);

      navigate('/');
    } catch (error) {
      console.error('Delivery partner logout failed:', error);
    }
  };

  if (loading) {
    return <ProfileLoading />;
  }

  // Logged in Customer

  if (customer && !owner && !deliveryPerson) {
    return (
      <CustomerProfile
        customer={customer}
        t={t}
        navigate={navigate}
        setSwitchRole={setSwitchRole}
        setDeliveryLoginTypeSheetOpen={setDeliveryLoginTypeSheetOpen}
        handleLogout={handleLogout}
        switchRole={switchRole}
        switchingRole={switchingRole}
        handleRoleSwitch={handleRoleSwitch}
        deliveryLoginTypeSheetOpen={deliveryLoginTypeSheetOpen}
        handleDeliveryRmaLogin={handleDeliveryRmaLogin}
        handleShopDeliveryLogin={handleShopDeliveryLogin}
      />
    );
  }

  // LOGGED-IN OWNER
  if (owner) {
    return (
      <OwnerProfile
        owner={owner}
        navigate={navigate}
        setSwitchRole={setSwitchRole}
        setDeliveryLoginTypeSheetOpen={setDeliveryLoginTypeSheetOpen}
        handleOwnerLogout={handleOwnerLogout}
        switchRole={switchRole}
        switchingRole={switchingRole}
        handleRoleSwitch={handleRoleSwitch}
        deliveryLoginTypeSheetOpen={deliveryLoginTypeSheetOpen}
        handleDeliveryRmaLogin={handleDeliveryRmaLogin}
        handleShopDeliveryLogin={handleShopDeliveryLogin}
      />
    );
  }

  // LOGGED-IN DELIVERY PARTNER
  if (deliveryPerson) {
    return (
      <DeliveryProfile
        deliveryPerson={deliveryPerson}
        navigate={navigate}
        setSwitchRole={setSwitchRole}
        handleDeliveryLogout={handleDeliveryLogout}
        switchRole={switchRole}
        switchingRole={switchingRole}
        handleRoleSwitch={handleRoleSwitch}
      />
    );
  }

  // ============================
  // GUEST CUSTOMER
  // ============================
  return (
    <>
      <GuestProfile
        t={t}
        navigate={navigate}
        setLoginSheetOpen={setLoginSheetOpen}
      />

      <LoginSheet
        isOpen={loginSheetOpen}
        onClose={() => setLoginSheetOpen(false)}
        navigate={navigate}
        setLoginSheetOpen={setLoginSheetOpen}
        setDeliveryLoginTypeSheetOpen={setDeliveryLoginTypeSheetOpen}
        deliveryLoginTypeSheetOpen={deliveryLoginTypeSheetOpen}
        handleDeliveryRmaLogin={handleDeliveryRmaLogin}
        handleShopDeliveryLogin={handleShopDeliveryLogin}
      />

      <GuestDeliveryLoginSheet
        isOpen={deliveryLoginTypeSheetOpen}
        customer={customer}
        setCustomer={setCustomer}
        setDeliveryLoginTypeSheetOpen={setDeliveryLoginTypeSheetOpen}
        navigate={navigate}
      />
    </>
  );
}

export default Profile;
