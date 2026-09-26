import './AdminOwners.css';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import OwnersHeader from './components/Owners/OwnersHeader';
import OwnersToolbar from './components/Owners/OwnersToolbar';
import OwnersTable from './components/Owners/OwnersTable';
import SettlementVerification from './components/Owners/SettlementVerification';
import OwnerDetailsModal from './components/Owners/OwnerDetailsModal';

import { fetchOwners, fetchSettlements } from './utils/Owners/ownersApi';

import { filterOwners } from './utils/Owners/ownersHelpers';

import useOwnerActions from './utils/Owners/useOwnerActions';

function AdminOwners() {
  const navigate = useNavigate();

  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [selectedOwner, setSelectedOwner] = useState(null);

  const [settlements, setSettlements] = useState([]);
  const [settlementsLoading, setSettlementsLoading] = useState(true);
  const [settlementsError, setSettlementsError] = useState('');
  const [settlementActionLoading, setSettlementActionLoading] = useState(null);
  const [payuOnboardingLoading, setPayuOnboardingLoading] = useState(null);
  const [payuVerificationLoading, setPayuVerificationLoading] = useState(null);

  const {
    handleSettlementAction,
    handlePayUOnboarding,
    handlePayUVerification,
  } = useOwnerActions({
    navigate,
    setOwners,
    setSettlements,
    setSelectedOwner,
    setSettlementsError,
    setSettlementActionLoading,
    setPayuOnboardingLoading,
    setPayuVerificationLoading,
  });

  useEffect(() => {
    async function loadOwners() {
      try {
        setLoading(true);
        setError('');

        const ownersData = await fetchOwners();

        setOwners(ownersData);
      } catch (err) {
        if (err.status === 401) {
          navigate('/admin/login', {
            replace: true,
          });
          return;
        }

        setError(err.message || 'Failed to fetch owners');
      } finally {
        setLoading(false);
      }
    }

    loadOwners();
  }, [navigate]);

  useEffect(() => {
    async function loadSettlements() {
      try {
        setSettlementsLoading(true);
        setSettlementsError('');

        const settlementsData = await fetchSettlements();

        setSettlements(settlementsData);
      } catch (err) {
        if (err.status === 401) {
          navigate('/admin/login', {
            replace: true,
          });
          return;
        }

        setSettlementsError(err.message || 'Failed to fetch settlements');
      } finally {
        setSettlementsLoading(false);
      }
    }

    loadSettlements();
  }, [navigate]);

  const filteredOwners = useMemo(() => {
    return filterOwners(owners, search);
  }, [owners, search]);

  if (loading) {
    return <div className="admin-page-loading">Loading owners...</div>;
  }

  return (
    <div className="admin-owners-page">
      <OwnersHeader
        ownerCount={owners.length}
        onBack={() => navigate('/admin/dashboard')}
      />

      {error && <div className="admin-page-error">{error}</div>}

      <SettlementVerification
        settlements={settlements}
        settlementsLoading={settlementsLoading}
        settlementsError={settlementsError}
        settlementActionLoading={settlementActionLoading}
        payuOnboardingLoading={payuOnboardingLoading}
        onSettlementAction={handleSettlementAction}
        onPayUOnboarding={handlePayUOnboarding}
      />

      <OwnersToolbar
        search={search}
        filteredCount={filteredOwners.length}
        totalCount={owners.length}
        onSearchChange={setSearch}
      />

      <OwnersTable owners={filteredOwners} onViewOwner={setSelectedOwner} />

      <OwnerDetailsModal
        selectedOwner={selectedOwner}
        onClose={() => setSelectedOwner(null)}
        onPayUOnboarding={handlePayUOnboarding}
        onPayUVerification={handlePayUVerification}
        payuOnboardingLoading={payuOnboardingLoading}
        payuVerificationLoading={payuVerificationLoading}
      />
    </div>
  );
}

export default AdminOwners;
