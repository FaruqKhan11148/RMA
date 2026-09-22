import { useEffect, useState } from 'react';
import './DeliveryPartners.css';

const API_URL = 'https://rma-backend-bo4a.onrender.com/';

function DeliveryPartners() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const approvePartner = async (partnerId) => {
    try {
      setError('');

      const response = await fetch(
        `${API_URL}api/admin/rma/${partnerId}/approve`,
        {
          method: 'PATCH',
          credentials: 'include',
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to approve delivery partner');
      }

      setPartners((currentPartners) =>
        currentPartners.filter((partner) => partner.id !== partnerId),
      );
    } catch (error) {
      console.error('Failed to approve delivery partner:', error);
      setError(error.message || 'Failed to approve delivery partner');
    }
  };

  const rejectPartner = async (partnerId) => {
    try {
      setError('');

      const response = await fetch(
        `${API_URL}api/admin/rma/${partnerId}/reject`,
        {
          method: 'PATCH',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            rejectionReason: 'Application did not meet our criteria',
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reject delivery partner');
      }

      setPartners((currentPartners) =>
        currentPartners.filter((partner) => partner.id !== partnerId),
      );
    } catch (error) {
      console.error('Failed to reject delivery partner:', error);
      setError(error.message || 'Failed to reject delivery partner');
    }
  };

  useEffect(() => {
    const fetchPendingPartners = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(
          `${API_URL}api/admin/delivery-partners/pending`,
          {
            method: 'GET',
            credentials: 'include',
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch delivery partners');
        }

        setPartners(data.deliveryPartners || []);
      } catch (error) {
        console.error('Failed to fetch delivery partners:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingPartners();
  }, []);

  if (loading) {
    return <div>Loading delivery partners...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="admin_delivery_partners_page">
      <div className="admin_delivery_partners_header">
        <div>
          <h1>Delivery Partners</h1>
          <p>Review and manage RMA delivery partner applications.</p>
        </div>

        <div className="admin_delivery_partners_count">
          {partners.length} Pending
        </div>
      </div>

      {partners.length === 0 ? (
        <div className="admin_empty_state">
          <div className="admin_empty_icon">✓</div>
          <h2>No Pending Applications</h2>
          <p>
            There are currently no delivery partner applications waiting for
            approval.
          </p>
        </div>
      ) : (
        <div className="admin_delivery_partners_grid">
          {partners.map((partner) => (
            <div className="admin_delivery_partner_card" key={partner.id}>
              <div className="admin_partner_card_top">
                <div className="admin_partner_avatar">
                  {partner.name?.charAt(0).toUpperCase()}
                </div>

                <div className="admin_partner_identity">
                  <h3>{partner.name}</h3>
                  <span>RMA Delivery Partner</span>
                </div>

                <div className="admin_pending_badge">Pending</div>
              </div>

              <div className="admin_partner_details">
                <div className="admin_partner_detail">
                  <span className="admin_detail_label">Phone</span>
                  <span className="admin_detail_value">{partner.phone}</span>
                </div>

                <div className="admin_partner_detail">
                  <span className="admin_detail_label">Applied On</span>
                  <span className="admin_detail_value">
                    {new Date(partner.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="admin_partner_actions">
                <button
                  type="button"
                  className="admin_reject_button"
                  onClick={() => rejectPartner(partner.id)}
                >
                  Reject
                </button>

                <button
                  type="button"
                  className="admin_approve_button"
                  onClick={() => approvePartner(partner.id)}
                >
                  Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DeliveryPartners;
