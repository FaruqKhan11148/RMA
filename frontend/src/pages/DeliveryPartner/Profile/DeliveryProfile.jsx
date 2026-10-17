import {
  UserRound,
  Phone,
  LogOut,
  ChevronRight,
  LayoutDashboard,
  Package,
  History,
  Wallet,
  Languages,
  Palette,
  CircleHelp,
  Info,
  MapPin,
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';

import './DeliveryProfile.css';

function DeliveryProfile() {
  const navigate = useNavigate();

  let deliveryPartner = null;

  try {
    const storedPartner = localStorage.getItem('delivery_person');
    deliveryPartner = storedPartner ? JSON.parse(storedPartner) : null;
  } catch (error) {
    console.error('Failed to parse delivery partner:', error);
  }

  const partnerName = deliveryPartner?.name || 'Delivery Partner';
  const phone = deliveryPartner?.phone || '—';
  // const shopId = deliveryPartner?.shopId || '—';

  const isOnline = ['AVAILABLE', 'BUSY'].includes(
    deliveryPartner?.availabilityStatus,
  );

  const handleLogout = () => {
    localStorage.removeItem('delivery_token');
    localStorage.removeItem('delivery_person');
    navigate('/delivery/rma-login');
  };

  const profileSections = [
    {
      title: 'My Activity',
      items: [
        {
          label: 'Delivery Dashboard',
          description: 'View your daily delivery summary',
          icon: LayoutDashboard,
          onClick: () => navigate('/delivery/dashboard'),
        },
        {
          label: 'My Deliveries',
          description: 'View and manage delivery orders',
          icon: Package,
          onClick: () => navigate('/delivery/orders-delivery'),
        },
        {
          label: 'Delivery History',
          description: 'Review your previous deliveries',
          icon: History,
          onClick: () => navigate('/delivery/history'),
        },
        {
          label: 'My Earnings',
          description: 'Check earnings and payment details',
          icon: Wallet,
          onClick: () => navigate('/delivery/earnings'),
        },
      ],
    },
    {
      title: 'My Account',
      items: [
        {
          label: 'Personal Details',
          description: phone,
          icon: UserRound,
          onClick: () => navigate('/delivery/profile/details'),
        },
        {
          label: 'Delivery Area',
          description: 'View your delivery assignments',
          icon: MapPin,
          onClick: () => navigate('/delivery/orders-delivery'),
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          label: 'Language',
          description: 'Choose your preferred language',
          icon: Languages,
          onClick: () => navigate('/profile/language'),
        },
        {
          label: 'Appearance',
          description: 'Light or dark theme',
          icon: Palette,
          onClick: () => navigate('/profile/appearance'),
        },
      ],
    },
    {
      title: 'Support & Information',
      items: [
        {
          label: 'Help & Support',
          description: 'Get help with your account or deliveries',
          icon: CircleHelp,
          onClick: () => navigate('/profile/help-support'),
        },
        {
          label: 'About RMA',
          description: 'Learn more about RMA',
          icon: Info,
          onClick: () => navigate('/about'),
        },
      ],
    },
  ];

  return (
    <main className="delivery_profile_page">
      <header className="delivery_profile_header">
        <div>
          <span>Delivery Partner</span>
          <h1>My Profile</h1>
          <p>Manage your account and delivery activity.</p>
        </div>
      </header>

      <section className="delivery_profile_card">
        <div className="delivery_profile_avatar">
          <UserRound size={30} />
        </div>

        <div className="delivery_profile_identity">
          <strong>{partnerName}</strong>
          <span>Delivery Partner</span>
          <div
            className={`delivery_profile_status ${
              isOnline ? 'online' : 'offline'
            }`}
          >
            <span className="delivery_profile_status_dot" />
            {isOnline ? 'Online' : 'Offline'}
          </div>
        </div>
      </section>

      <section className="delivery_profile_section">
        <h2>Personal Details</h2>

        <div className="delivery_profile_item">
          <div className="delivery_profile_item_icon">
            <Phone size={18} />
          </div>

          <div className="delivery_profile_item_content">
            <span>Phone Number</span>
            <strong>{phone}</strong>
          </div>
        </div>

        {/* <div className="delivery_profile_item">
          <div className="delivery_profile_item_icon">
            <Store size={18} />
          </div>

          <div className="delivery_profile_item_content">
            <span>Assigned Shop ID</span>
            <strong>{shopId}</strong>
          </div>
        </div> */}
      </section>

      {profileSections.map((section) => (
        <section className="delivery_profile_section" key={section.title}>
          <h2>{section.title}</h2>

          <div className="delivery_profile_actions">
            {section.items.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  className="delivery_profile_action"
                  type="button"
                  key={item.label}
                  onClick={item.onClick}
                >
                  <span className="delivery_profile_action_icon">
                    <Icon size={19} />
                  </span>

                  <span className="delivery_profile_action_content">
                    <strong>{item.label}</strong>
                    <span>{item.description}</span>
                  </span>

                  <ChevronRight
                    className="delivery_profile_action_arrow"
                    size={19}
                  />
                </button>
              );
            })}
          </div>
        </section>
      ))}

      <button
        type="button"
        className="delivery_profile_action delivery_profile_logout"
        onClick={handleLogout}
      >
        <span className="delivery_profile_action_icon logout">
          <LogOut size={19} />
        </span>

        <span className="delivery_profile_action_content">
          <strong>Logout</strong>
          <span>Sign out of your delivery account</span>
        </span>

        <ChevronRight className="delivery_profile_action_arrow" size={19} />
      </button>

      <footer className="delivery_profile_footer">
        RMA · Delivery Partner
      </footer>
    </main>
  );
}

export default DeliveryProfile;
