import { UserRound, Phone, Store, LogOut, ChevronRight } from 'lucide-react';

import { useNavigate } from 'react-router-dom';

import './DeliveryProfile.css';

function DeliveryProfile() {
  const navigate = useNavigate();

  const storedPartner = sessionStorage.getItem('delivery_person');

  let deliveryPartner = null;

  if (storedPartner) {
    try {
      deliveryPartner = JSON.parse(storedPartner);
    } catch (error) {
      console.error('Failed to parse delivery partner:', error);
    }
  }

  const partnerName = deliveryPartner?.name || 'Delivery Partner';

  const phone = deliveryPartner?.phone || '—';

  const shopId = deliveryPartner?.shopId || '—';

  const handleLogout = () => {
    sessionStorage.removeItem('delivery_token');
    sessionStorage.removeItem('delivery_person');

    navigate('/delivery/rma-login');
  };

  return (
    <main className="delivery_profile_page">
      <header className="delivery_profile_header">
        <div>
          <span>Delivery Partner</span>
          <h1>Profile</h1>
        </div>
      </header>

      <section className="delivery_profile_card">
        <div className="delivery_profile_avatar">
          <UserRound size={30} />
        </div>

        <div className="delivery_profile_identity">
          <strong>{partnerName}</strong>

          <span>Delivery Partner</span>
        </div>
      </section>

      <section className="delivery_profile_section">
        <h2>Personal Details</h2>

        <div className="delivery_profile_item">
          <div className="delivery_profile_item_icon">
            <Phone size={18} />
          </div>

          <div>
            <span>Phone Number</span>
            <strong>{phone}</strong>
          </div>
        </div>

        <div className="delivery_profile_item">
          <div className="delivery_profile_item_icon">
            <Store size={18} />
          </div>

          <div>
            <span>Assigned Shop</span>
            <strong>{shopId}</strong>
          </div>
        </div>
      </section>

      <section className="delivery_profile_section">
        <h2>Account</h2>

        <button
          type="button"
          className="delivery_profile_action"
          onClick={handleLogout}
        >
          <div className="delivery_profile_action_left">
            <div className="delivery_profile_action_icon logout">
              <LogOut size={18} />
            </div>

            <span>Logout</span>
          </div>

          <ChevronRight size={18} />
        </button>
      </section>
    </main>
  );
}

export default DeliveryProfile;
