import { Settings } from 'lucide-react';

function OwnerDashboardHeader({ shopOwner, navigate }) {
  return (
    <section className="owner_dashboard_header">
      <div>
        <p>Welcome back ,</p>

        <h1>{shopOwner.ownerName}</h1>

        <span>{shopOwner.shopName}</span>
      </div>

      <div className="owner_header_actions">
        <button
          type="button"
          className="owner_settings_button"
          onClick={() => navigate('/owner/settings/account')}
          aria-label="Settings"
          title="Settings"
        >
          <Settings size={20} />
        </button>
      </div>
    </section>
  );
}

export default OwnerDashboardHeader;
