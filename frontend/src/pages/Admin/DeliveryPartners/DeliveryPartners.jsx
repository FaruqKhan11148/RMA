import { useEffect, useState } from 'react';
import './DeliveryPartners.css';

import DeliveryPartnersHeader from './components/DeliveryPartnersHeader';
import DeliveryPartnerCard from './components/DeliveryPartnerCard';
import DeliveryPartnersEmpty from './components/DeliveryPartnersEmpty';

import {
  fetchPendingPartners,
  approvePartner,
  rejectPartner,
} from './utils/deliveryPartnerApi';

function DeliveryPartners() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleApprovePartner = async (partnerId) => {
    try {
      setError('');

      await approvePartner(partnerId);

      setPartners((currentPartners) =>
        currentPartners.filter((partner) => partner.id !== partnerId),
      );
    } catch (error) {
      console.error('Failed to approve delivery partner:', error);

      setError(error.message || 'Failed to approve delivery partner');
    }
  };

  const handleRejectPartner = async (partnerId) => {
    try {
      setError('');

      await rejectPartner(partnerId);

      setPartners((currentPartners) =>
        currentPartners.filter((partner) => partner.id !== partnerId),
      );
    } catch (error) {
      console.error('Failed to reject delivery partner:', error);

      setError(error.message || 'Failed to reject delivery partner');
    }
  };

  useEffect(() => {
    const loadPendingPartners = async () => {
      try {
        setLoading(true);
        setError('');

        const deliveryPartners = await fetchPendingPartners();

        setPartners(deliveryPartners);
      } catch (error) {
        console.error('Failed to fetch delivery partners:', error);

        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadPendingPartners();
  }, []);

  if (loading) {
    return <div>Loading delivery partners...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="admin_delivery_partners_page">
      <DeliveryPartnersHeader count={partners.length} />

      {partners.length === 0 ? (
        <DeliveryPartnersEmpty />
      ) : (
        <div className="admin_delivery_partners_grid">
          {partners.map((partner) => (
            <DeliveryPartnerCard
              key={partner.id}
              partner={partner}
              onApprove={handleApprovePartner}
              onReject={handleRejectPartner}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default DeliveryPartners;
