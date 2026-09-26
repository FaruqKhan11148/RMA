import './OwnerSettings.css';

import { useNavigate } from 'react-router-dom';

import OwnerSettingsHeader from './components/OwnerSettingsHeader';
import SettingsSection from './components/SettingsSection';

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
        {
          title: 'Delivery Person',
          description: 'Register and manage your delivery person',
          path: '/owner/settings/delivery/person',
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
    {
      title: 'Shop Promotion',
      description: 'Help customers discover and order from your shop',
      items: [
        {
          title: 'Shop QR & Poster',
          description:
            'Download your personalized QR code and A4 ordering poster',
          path: '/owner/settings/shop-promotion',
        },
      ],
    },
    {
      title: 'Offers & Rewards',
      description: 'Complete offers and earn rewards from RMA',
      items: [
        {
          title: 'RMA Rewards',
          description:
            'Complete orders, refer shop owners and track your rewards',
          path: '/owner/offers',
        },
      ],
    },
  ];

  return (
    <div className="owner-settings-page">
      <OwnerSettingsHeader navigate={navigate} />

      <div className="settings-sections">
        {sections.map((section) => (
          <SettingsSection
            key={section.title}
            section={section}
            navigate={navigate}
          />
        ))}
      </div>
    </div>
  );
}

export default OwnerSettings;
