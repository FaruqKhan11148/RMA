import './Profile.css';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

function RoleSwitchSheet({
  switchRole,
  switchingRole,
  currentRole,
  onCancel,
  onConfirm,
}) {
  if (!switchRole) {
    return null;
  }

  const currentRoleName =
    currentRole === 'customer'
      ? 'Customer'
      : currentRole === 'owner'
        ? 'Owner'
        : 'Delivery Partner';

  const targetRoleName =
    switchRole === 'customer'
      ? 'Customer'
      : switchRole === 'owner'
        ? 'Owner'
        : 'Delivery Partner';

  return (
    <div
      className="profile_switch_overlay"
      onClick={() => {
        if (!switchingRole) {
          onCancel();
        }
      }}
    >
      <section
        className="profile_switch_sheet"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="profile_switch_handle" />

        <div className="profile_switch_header">
          <h2>Switch Account?</h2>

          <p>
            You are currently logged in as {currentRoleName}. Do you want to
            switch to {targetRoleName}?
          </p>
        </div>

        <div className="profile_switch_actions">
          <button
            type="button"
            className="profile_switch_cancel"
            onClick={onCancel}
            disabled={switchingRole}
          >
            Cancel
          </button>

          <button
            type="button"
            className="profile_switch_confirm"
            onClick={onConfirm}
            disabled={switchingRole}
          >
            {switchingRole ? 'Switching...' : 'Switch'}
          </button>
        </div>
      </section>
    </div>
  );
}

function DeliveryLoginTypeSheet({ isOpen, onClose, onRmaLogin, onShopLogin }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="profile_login_overlay" onClick={onClose}>
      <section
        className="profile_login_sheet"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="profile_login_sheet_handle" />

        <div className="profile_login_sheet_header">
          <h2>Delivery Partner Login</h2>

          <p>Choose your delivery partner type</p>
        </div>

        <div className="profile_login_options">
          <button
            type="button"
            className="profile_login_option"
            onClick={onRmaLogin}
          >
            <div>
              <strong>RMA Delivery Partner</strong>

              <span>Login to your RMA delivery partner account</span>
            </div>

            <span>›</span>
          </button>

          <button
            type="button"
            className="profile_login_option"
            onClick={onShopLogin}
          >
            <div>
              <strong>Particular Shop Delivery Partner</strong>

              <span>Login to a specific shop's delivery account</span>
            </div>

            <span>›</span>
          </button>
        </div>

        <button
          type="button"
          className="profile_login_cancel"
          onClick={onClose}
        >
          Cancel
        </button>
      </section>
    </div>
  );
}

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
    navigate('/delivery/orders');
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
        navigate('/delivery/orders');
      }
    } catch (error) {
      console.error('Role switch failed:', error);
      setSwitchingRole(false);
    }
  };

  if (loading) {
    return (
      <main className="profile">
        <section className="profile_loading">
          <div className="profile_loading_spinner" />
          <p>Loading your profile...</p>
        </section>
      </main>
    );
  }

  // ============================
  // LOGGED-IN CUSTOMER
  // ============================
  if (customer && !owner && !deliveryPerson) {
    const firstLetter = customer.name
      ? customer.name.charAt(0).toUpperCase()
      : 'R';

    return (
      <main className="profile">
        <section className="profile_header">
          <div className="profile_avatar">{firstLetter}</div>

          <h1>{customer.name}</h1>

          <p>{customer.email}</p>
        </section>

        <section className="profile_customer_card">
          <div className="profile_customer_row">
            <span>Mobile</span>
            <strong>{customer.phone}</strong>
          </div>

          <div className="profile_customer_row">
            <span>Email</span>
            <strong>{customer.email}</strong>
          </div>
        </section>

        <section className="profile_section">
          <h2>My Activity</h2>

          <button className="profile_item" onClick={() => navigate('/orders')}>
            <span>{t.bottomNav.orders}</span>
            <span>›</span>
          </button>
        </section>

        <section className="profile_section">
          <h2>My Account</h2>

          <button
            className="profile_item"
            onClick={() => navigate('/profile/personal-details')}
          >
            <span>Personal Details</span>
            <span>›</span>
          </button>

          <button
            className="profile_item"
            onClick={() => navigate('/profile/saved-addresses')}
          >
            <span>Saved Addresses</span>
            <span>›</span>
          </button>
        </section>

        <section className="profile_section">
          <h2>Preferences</h2>

          <button
            className="profile_item"
            onClick={() => navigate('/profile/language')}
          >
            <span>Language</span>
            <span>›</span>
          </button>
        </section>

        <section className="profile_section">
          <h2>Owner</h2>

          <button
            className="profile_item"
            onClick={() => setSwitchRole('owner')}
          >
            <span>Owner Login</span>
            <span>›</span>
          </button>

          <button
            className="profile_item"
            onClick={() => navigate('/owner/register/step-1')}
          >
            <span>Register Your Shop</span>
            <span>›</span>
          </button>

          <button
            className="profile_item"
            onClick={() => navigate('/owner/dashboard')}
          >
            <span>Owner Dashboard</span>
            <span>›</span>
          </button>
        </section>

        <section className="profile_section">
          <h2>Delivery Partner</h2>

          <button
            className="profile_item"
            onClick={() => setDeliveryLoginTypeSheetOpen(true)}
          >
            <span>Delivery Partner Login</span>
            <span>›</span>
          </button>

          <button
            className="profile_item"
            onClick={() => navigate('/delivery-partner/register')}
          >
            <span>Become a Delivery Partner</span>
            <span>›</span>
          </button>

          <button
            className="profile_item"
            onClick={() => navigate('/delivery/orders')}
          >
            <span>Delivery Partner Dashboard</span>
            <span>›</span>
          </button>
        </section>

        <section className="profile_section">
          <h2>Support</h2>

          <button
            className="profile_item"
            onClick={() => navigate('/profile/help-support')}
          >
            <span>Help & Support</span>
            <span>›</span>
          </button>
        </section>

        <button className="logout_button" onClick={handleLogout}>
          Logout
        </button>

        <RoleSwitchSheet
          switchRole={switchRole}
          switchingRole={switchingRole}
          currentRole="customer"
          onCancel={() => setSwitchRole(null)}
          onConfirm={handleRoleSwitch}
        />

        <DeliveryLoginTypeSheet
          isOpen={deliveryLoginTypeSheetOpen}
          onClose={() => setDeliveryLoginTypeSheetOpen(false)}
          onRmaLogin={handleDeliveryRmaLogin}
          onShopLogin={handleShopDeliveryLogin}
        />
      </main>
    );
  }

  // ============================
  // LOGGED-IN OWNER
  // ============================
  if (owner) {
    const firstLetter = owner.ownerName
      ? owner.ownerName.charAt(0).toUpperCase()
      : 'R';

    return (
      <main className="profile">
        <section className="profile_header">
          <div className="profile_avatar">{firstLetter}</div>

          <h1>{owner.ownerName}</h1>

          <p>{owner.shopName}</p>
        </section>

        <section className="profile_customer_card">
          <div className="profile_customer_row">
            <span>Shop ID</span>
            <strong>{owner.shopId}</strong>
          </div>

          <div className="profile_customer_row">
            <span>Mobile</span>
            <strong>{owner.phone}</strong>
          </div>

          <div className="profile_customer_row">
            <span>Email</span>
            <strong>{owner.email}</strong>
          </div>
        </section>

        <section className="profile_section">
          <h2>My Shop</h2>

          <button
            className="profile_item"
            onClick={() => navigate('/owner/dashboard')}
          >
            <span>Owner Dashboard</span>
            <span>›</span>
          </button>

          <button
            className="profile_item"
            onClick={() => navigate('/owner/offers')}
          >
            <span>Offers & Rewards</span>
            <span>›</span>
          </button>
        </section>

        <section className="profile_section">
          <h2>Preferences</h2>

          <button
            className="profile_item"
            onClick={() => navigate('/profile/language')}
          >
            <span>Language</span>
            <span>›</span>
          </button>
        </section>

        <section className="profile_section">
          <h2>Support</h2>

          <button
            className="profile_item"
            onClick={() => navigate('/profile/help-support')}
          >
            <span>Help & Support</span>
            <span>›</span>
          </button>
        </section>

        <section className="profile_section">
          <h2>Switch Account</h2>

          <button
            className="profile_item"
            onClick={() => setSwitchRole('customer')}
          >
            <span>Customer Login</span>
            <span>›</span>
          </button>

          <button
            className="profile_item"
            onClick={() => setDeliveryLoginTypeSheetOpen(true)}
          >
            <span>Delivery Partner Login</span>
            <span>›</span>
          </button>
        </section>

        <button
          className="logout_button"
          onClick={async () => {
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
          }}
        >
          Logout
        </button>
        <RoleSwitchSheet
          switchRole={switchRole}
          switchingRole={switchingRole}
          currentRole="owner"
          onCancel={() => setSwitchRole(null)}
          onConfirm={handleRoleSwitch}
        />
        <DeliveryLoginTypeSheet
          isOpen={deliveryLoginTypeSheetOpen}
          onClose={() => setDeliveryLoginTypeSheetOpen(false)}
          onRmaLogin={handleDeliveryRmaLogin}
          onShopLogin={handleShopDeliveryLogin}
        />
      </main>
    );
  }

  // COMMON ROLE SWITCH SHEET
  // ============================
  // LOGGED-IN DELIVERY PARTNER
  // ============================
  if (deliveryPerson) {
    const firstLetter = deliveryPerson.name
      ? deliveryPerson.name.charAt(0).toUpperCase()
      : 'D';

    return (
      <main className="profile">
        <section className="profile_header">
          <div className="profile_avatar">{firstLetter}</div>

          <h1>{deliveryPerson.name}</h1>

          <p>Delivery Partner</p>
        </section>

        <section className="profile_customer_card">
          <div className="profile_customer_row">
            <span>Shop ID</span>
            <strong>{deliveryPerson.shopId}</strong>
          </div>

          <div className="profile_customer_row">
            <span>Mobile</span>
            <strong>{deliveryPerson.phone}</strong>
          </div>
        </section>

        <section className="profile_section">
          <h2>My Activity</h2>

          <button
            className="profile_item"
            onClick={() => navigate('/delivery/orders')}
          >
            <span>Delivery Orders</span>
            <span>›</span>
          </button>
        </section>

        <section className="profile_section">
          <h2>Preferences</h2>

          <button
            className="profile_item"
            onClick={() => navigate('/profile/language')}
          >
            <span>Language</span>
            <span>›</span>
          </button>
        </section>

        <section className="profile_section">
          <h2>Support</h2>

          <button
            className="profile_item"
            onClick={() => navigate('/profile/help-support')}
          >
            <span>Help & Support</span>
            <span>›</span>
          </button>
        </section>

        <section className="profile_section">
          <h2>Switch Account</h2>

          <button
            className="profile_item"
            onClick={() => setSwitchRole('customer')}
          >
            <span>Customer Login</span>
            <span>›</span>
          </button>

          <button
            className="profile_item"
            onClick={() => setSwitchRole('owner')}
          >
            <span>Owner Login</span>
            <span>›</span>
          </button>
        </section>

        <button
          className="logout_button"
          onClick={async () => {
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
          }}
        >
          Logout
        </button>

        <RoleSwitchSheet
          switchRole={switchRole}
          switchingRole={switchingRole}
          currentRole="delivery"
          onCancel={() => setSwitchRole(null)}
          onConfirm={handleRoleSwitch}
        />
      </main>
    );
  }

  // ============================
  // GUEST CUSTOMER
  // ============================
  return (
    <main className="profile">
      <section className="profile_header">
        <div className="profile_avatar">R</div>

        <h1>Your RMA Account</h1>

        <p>Sign in to make ordering faster and easier.</p>
      </section>

      <section className="profile_auth">
        <button
          className="profile_auth_button login_button"
          onClick={() => setLoginSheetOpen(true)}
        >
          <div className="profile_auth_content">
            <strong>Login to RMA</strong>

            <span style={{ fontWeight: '600', color: 'white' }}>
              Customer, Shop Owner or Delivery Partner
            </span>
          </div>

          <span className="profile_arrow">›</span>
        </button>

        <button
          className="profile_auth_button signup_button"
          onClick={() => navigate('/customer/signup')}
        >
          <div className="profile_auth_content">
            <strong>Create Account</strong>

            <span>Save your details and order faster</span>
          </div>

          <span className="profile_arrow">›</span>
        </button>
      </section>

      <section className="profile_guest_card">
        <div className="profile_guest_icon">✓</div>

        <div>
          <h2>Prefer not to sign in?</h2>

          <p>
            No problem. You can continue shopping and place orders as a guest.
          </p>
        </div>
      </section>

      <section className="profile_section">
        <h2>My Activity</h2>

        <button className="profile_item" onClick={() => navigate('/orders')}>
          <span>{t.bottomNav.orders}</span>
          <span>›</span>
        </button>
      </section>

      <section className="profile_section">
        <h2>Preferences</h2>

        <button className="profile_item">
          <span>Language</span>
          <span>›</span>
        </button>
      </section>

      <section className="profile_section">
        <h2>Support</h2>

        <button
          className="profile_item"
          onClick={() => navigate('/profile/help-support')}
        >
          <span>Help & Support</span>
          <span>›</span>
        </button>
      </section>
      {loginSheetOpen && (
        <div
          className="profile_login_overlay"
          onClick={() => setLoginSheetOpen(false)}
        >
          <section
            className="profile_login_sheet"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="profile_login_sheet_handle" />

            <div className="profile_login_sheet_header">
              <h2>Login to RMA</h2>

              <p>Choose how you want to continue</p>
            </div>

            <div className="profile_login_options">
              <button
                type="button"
                className="profile_login_option"
                onClick={() => navigate('/customer/login')}
              >
                <div>
                  <strong>Customer</strong>

                  <span>Login to your customer account</span>
                </div>

                <span>›</span>
              </button>

              <button
                type="button"
                className="profile_login_option"
                onClick={() => navigate('/owner/login')}
              >
                <div>
                  <strong>Owner</strong>

                  <span>Login to your shop account</span>
                </div>

                <span>›</span>
              </button>

              <button
                type="button"
                className="profile_login_option"
                onClick={() => {
                  setLoginSheetOpen(false);
                  setDeliveryLoginTypeSheetOpen(true);
                }}
              >
                <div>
                  <strong>Delivery Partner</strong>

                  <span>Login to your delivery account</span>
                </div>

                <span>›</span>
              </button>
            </div>

            <button
              type="button"
              className="profile_login_cancel"
              onClick={() => setLoginSheetOpen(false)}
            >
              Cancel
            </button>
          </section>
          <DeliveryLoginTypeSheet
            isOpen={deliveryLoginTypeSheetOpen}
            onClose={() => setDeliveryLoginTypeSheetOpen(false)}
            onRmaLogin={handleDeliveryRmaLogin}
            onShopLogin={handleShopDeliveryLogin}
          />
        </div>
      )}

      {deliveryLoginTypeSheetOpen && (
        <div
          className="profile_login_overlay"
          onClick={() => setDeliveryLoginTypeSheetOpen(false)}
        >
          <section
            className="profile_login_sheet"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="profile_login_sheet_handle" />

            <div className="profile_login_sheet_header">
              <h2>Delivery Partner Login</h2>

              <p>Choose your delivery partner type</p>
            </div>

            <div className="profile_login_options">
              <button
                type="button"
                className="profile_login_option"
                onClick={async () => {
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

                  setDeliveryLoginTypeSheetOpen(false);
                  navigate('/delivery/rma-login');
                }}
              >
                <div>
                  <strong>RMA Delivery Partner</strong>

                  <span>Login to your RMA delivery partner account</span>
                </div>

                <span>›</span>
              </button>

              <button
                type="button"
                className="profile_login_option"
                onClick={async () => {
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

                  setDeliveryLoginTypeSheetOpen(false);
                  navigate('/delivery/orders');
                }}
              >
                <div>
                  <strong>Particular Shop Delivery Partner</strong>

                  <span>Login to a specific shop's delivery account</span>
                </div>

                <span>›</span>
              </button>
            </div>

            <button
              type="button"
              className="profile_login_cancel"
              onClick={() => setDeliveryLoginTypeSheetOpen(false)}
            >
              Cancel
            </button>
          </section>
        </div>
      )}
    </main>
  );
}

export default Profile;
