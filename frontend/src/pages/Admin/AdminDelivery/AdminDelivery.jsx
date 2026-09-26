import './AdminDelivery.css';

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import DeliveryHeader from './components/DeliveryHeader';
import DeliveryStats from './components/DeliveryStats';
import DeliveryControls from './components/DeliveryControls';
import DeliveryTable from './components/DeliveryTable';
import DeliveryDetailsModal from './components/DeliveryDetailsModal';

import {
  fetchDeliveryPersons,
  fetchDeliveryPersonDetails,
} from './utils/deliveryApi';

import {
  formatDate,
  getStatusClass,
  getReadableStatus,
} from './utils/deliveryHelpers';

function AdminDelivery() {
  const navigate = useNavigate();

  const [deliveryPersons, setDeliveryPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [selectedPerson, setSelectedPerson] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const loadDeliveryPersons = async () => {
      try {
        setLoading(true);
        setError('');

        const deliveryPersonList = await fetchDeliveryPersons();

        setDeliveryPersons(deliveryPersonList);
      } catch (error) {
        console.error('Admin delivery fetch error:', error);

        if (error.status === 401) {
          navigate('/admin/login');
          return;
        }

        setError(error.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    loadDeliveryPersons();
  }, [navigate]);

  const filteredDeliveryPersons = useMemo(() => {
    return deliveryPersons.filter((person) => {
      const owner = person.ownerId || {};
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        !searchText ||
        person.name?.toLowerCase().includes(searchText) ||
        person.phone?.toLowerCase().includes(searchText) ||
        person.shopId?.toLowerCase().includes(searchText) ||
        owner.shopName?.toLowerCase().includes(searchText) ||
        owner.ownerName?.toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && person.isActive) ||
        (statusFilter === 'INACTIVE' && !person.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [deliveryPersons, search, statusFilter]);

  const totalDeliveryPersons = deliveryPersons.length;

  const activeDeliveryPersons = deliveryPersons.filter(
    (person) => person.isActive,
  ).length;

  const inactiveDeliveryPersons = deliveryPersons.filter(
    (person) => !person.isActive,
  ).length;

  const totalDeliveryOrders = deliveryPersons.reduce(
    (total, person) => total + (person.totalDeliveryOrders || 0),
    0,
  );

  const completedDeliveries = deliveryPersons.reduce(
    (total, person) => total + (person.completedOrders || 0),
    0,
  );

  const activeDeliveries = deliveryPersons.reduce(
    (total, person) => total + (person.activeOrders || 0),
    0,
  );

  const handleViewDetails = async (person) => {
    try {
      setError('');

      const deliveryPerson = await fetchDeliveryPersonDetails(person.shopId);

      setSelectedPerson(deliveryPerson);
      setShowModal(true);
    } catch (error) {
      console.error('Delivery person details error:', error);

      if (error.status === 401) {
        navigate('/admin/login');
        return;
      }

      setError(error.message || 'Failed to load details');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPerson(null);
  };

  return (
    <div className="admin-delivery-page">
      <DeliveryHeader onBack={() => navigate('/admin/dashboard')} />

      {error && <div className="admin-delivery-error">{error}</div>}

      <DeliveryStats
        totalDeliveryPersons={totalDeliveryPersons}
        activeDeliveryPersons={activeDeliveryPersons}
        inactiveDeliveryPersons={inactiveDeliveryPersons}
        activeDeliveries={activeDeliveries}
        completedDeliveries={completedDeliveries}
        totalDeliveryOrders={totalDeliveryOrders}
      />

      <DeliveryControls
        search={search}
        statusFilter={statusFilter}
        onSearchChange={setSearch}
        onStatusFilterChange={setStatusFilter}
      />

      <DeliveryTable
        loading={loading}
        filteredDeliveryPersons={filteredDeliveryPersons}
        onViewDetails={handleViewDetails}
      />

      <DeliveryDetailsModal
        selectedPerson={selectedPerson}
        showModal={showModal}
        onClose={closeModal}
        formatDate={formatDate}
        getStatusClass={getStatusClass}
        getReadableStatus={getReadableStatus}
      />
    </div>
  );
}

export default AdminDelivery;
