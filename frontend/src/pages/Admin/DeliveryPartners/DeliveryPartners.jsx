import { useEffect, useMemo, useState } from 'react';
import './DeliveryPartners.css';

import DeliveryPartnersHeader from './components/DeliveryPartnersHeader';
import DeliveryPartnerCard from './components/DeliveryPartnerCard';
import DeliveryPartnerReview from './components/DeliveryPartnerReview';
import DeliveryPartnersEmpty from './components/DeliveryPartnersEmpty';

import {
  fetchAllRmaDeliveryPartners,
  fetchPartnerApplication,
  approvePartner,
} from './utils/deliveryPartnerApi';

function DeliveryPartners() {
  const [partners, setPartners] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);

  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(false);

  const [error, setError] = useState('');
  const [reviewError, setReviewError] = useState('');

  const [activeFilter, setActiveFilter] = useState('ALL');

  const loadDeliveryPartners = async () => {
    try {
      setLoading(true);
      setError('');

      const deliveryPartners = await fetchAllRmaDeliveryPartners();

      setPartners(deliveryPartners);
    } catch (error) {
      console.error('Failed to fetch RMA delivery partners:', error);

      setError(error.message || 'Failed to fetch delivery partners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeliveryPartners();
  }, []);

  const statusCounts = useMemo(() => {
    return {
      ALL: partners.length,

      INCOMPLETE: partners.filter(
        (partner) => partner.applicationStatus === 'INCOMPLETE',
      ).length,

      SUBMITTED: partners.filter(
        (partner) => partner.applicationStatus === 'SUBMITTED',
      ).length,

      UNDER_REVIEW: partners.filter(
        (partner) => partner.applicationStatus === 'UNDER_REVIEW',
      ).length,

      CORRECTION_REQUIRED: partners.filter(
        (partner) => partner.applicationStatus === 'CORRECTION_REQUIRED',
      ).length,

      APPROVED: partners.filter(
        (partner) => partner.applicationStatus === 'APPROVED',
      ).length,

      REJECTED: partners.filter(
        (partner) => partner.applicationStatus === 'REJECTED',
      ).length,
    };
  }, [partners]);

  const filteredPartners = useMemo(() => {
    if (activeFilter === 'ALL') {
      return partners;
    }

    return partners.filter(
      (partner) => partner.applicationStatus === activeFilter,
    );
  }, [partners, activeFilter]);

  const handleReviewPartner = async (partnerId) => {
    try {
      setReviewLoading(true);
      setReviewError('');

      const partner = await fetchPartnerApplication(partnerId);

      setSelectedPartner(partner);
    } catch (error) {
      console.error('Failed to fetch delivery partner application:', error);

      setReviewError(
        error.message || 'Failed to load delivery partner application',
      );
    } finally {
      setReviewLoading(false);
    }
  };

  const handleBackToPartners = () => {
    setSelectedPartner(null);
    setReviewError('');
  };

  const handleApprovePartner = async () => {
    if (!selectedPartner?.id) return;

    const confirmed = window.confirm(
      `Are you sure you want to approve ${selectedPartner.name} as an RMA Delivery Partner?`,
    );

    if (!confirmed) return;

    try {
      setReviewError('');

      await approvePartner(selectedPartner.id);

      setSelectedPartner(null);

      await loadDeliveryPartners();
    } catch (error) {
      console.error('Failed to approve delivery partner:', error);

      setReviewError(error.message || 'Failed to approve delivery partner');
    }
  };

  if (selectedPartner || reviewLoading || reviewError) {
    return (
      <DeliveryPartnerReview
        partner={selectedPartner}
        loading={reviewLoading}
        error={reviewError}
        onBack={handleBackToPartners}
        onApprove={handleApprovePartner}
      />
    );
  }

  if (loading) {
    return (
      <div className="admin_delivery_partners_page">
        <div className="admin_review_loading">Loading delivery partners...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin_delivery_partners_page">
        <div className="admin_review_error">
          <h2>Unable to load delivery partners</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin_delivery_partners_page">
      <DeliveryPartnersHeader
        counts={statusCounts}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      {filteredPartners.length === 0 ? (
        <DeliveryPartnersEmpty filter={activeFilter} />
      ) : (
        <div className="admin_delivery_partners_grid">
          {filteredPartners.map((partner) => (
            <DeliveryPartnerCard
              key={partner.id}
              partner={partner}
              onReview={handleReviewPartner}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default DeliveryPartners;
