import './OwnerSettings.css';

import { useNavigate } from 'react-router-dom';

function OwnerSettings() {
  const navigate = useNavigate();

  const sections = [
    {
      title: 'Account',
      description: 'Manage your personal account information',
      items: [
        {
          title: 'Owner Name',
          description: 'Update your name',
          path: '/owner/settings/account/name',
        },
        {
          title: 'Phone Number',
          description: 'Change your registered phone number',
          path: '/owner/settings/account/phone',
        },
        {
          title: 'Email',
          description: 'Update your email address',
          path: '/owner/settings/account/email',
        },
        {
          title: 'Password',
          description: 'Change your account password',
          path: '/owner/settings/account/password',
        },
      ],
    },

    {
      title: 'Shop',
      description: 'Manage your shop information',
      items: [
        {
          title: 'Shop Name',
          description: 'Update your shop name',
          path: '/owner/settings/shop/name',
        },
        {
          title: 'Description',
          description: 'Update your shop description',
          path: '/owner/settings/shop/description',
        },
        {
          title: 'Address',
          description: 'Update your shop address',
          path: '/owner/settings/shop/address',
        },
        {
          title: 'Location',
          description: 'Update your shop location on the map',
          path: '/owner/settings/shop/location',
        },
        {
          title: 'Shop Status',
          description: 'Open or close your shop',
          path: '/owner/settings/shop/open-closed',
        },
      ],
    },

    {
      title: 'Products',
      description: 'Manage products available in your shop',
      items: [
        {
          title: 'Manage Products',
          description:
            'View, edit, change price, availability and remove products',
          path: '/owner/settings/products',
        },
        {
          title: 'Add Product',
          description: 'Add a catalogue or custom product',
          path: '/owner/settings/products/add',
        },
      ],
    },

    {
      title: 'Delivery',
      description: 'Configure your delivery and pickup options',
      items: [
        {
          title: 'Delivery Available',
          description: 'Enable or disable customer delivery',
          path: '/owner/settings/delivery/available',
        },
        {
          title: 'Pickup Available',
          description: 'Enable or disable shop pickup',
          path: '/owner/settings/delivery/pickup',
        },
        {
          title: 'Delivery Settings',
          description:
            'Configure radius, charges, minimum order and delivery time',
          path: '/owner/settings/delivery/settings',
        },
      ],
    },

    {
      title: 'Payment',
      description: 'Manage your payment and settlement information',
      items: [
        {
          title: 'Payment Details',
          description: 'View payment provider, KYC and settlement status',
          path: '/owner/settings/payment',
        },
      ],
    },
  ];

  return (
    <div className="owner-settings-page">
      <div className="owner-settings-header">
        <button
          className="back-button"
          onClick={() => navigate('/owner/settings/account')}
        >
          ← Dashboard
        </button>

        <div>
          <h1>Settings</h1>
          <p>Manage your account, shop, products, delivery and payments.</p>
        </div>
      </div>

      <div className="settings-sections">
        {sections.map((section) => (
          <section className="settings-section" key={section.title}>
            <div className="section-heading">
              <h2>{section.title}</h2>
              <p>{section.description}</p>
            </div>

            <div className="settings-options">
              {section.items.map((item) => (
                <button
                  className="settings-option"
                  key={item.path}
                  onClick={() => navigate(item.path)}
                >
                  <div className="option-content">
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>

                  <span className="option-arrow">›</span>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

export default OwnerSettings;
