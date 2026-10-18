import './DeliveryDashboard.css';

import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import DeliveryDashboardHeader from './components/DeliveryDashboardHeader';
import DeliveryStatusCard from './components/DeliveryStatusCard';
import DeliverySummary from './components/DeliverySummary';
import ActiveDelivery from './components/ActiveDelivery';
import DeliveryRequests from './components/DeliveryRequests';
import DeliveryArea from './components/DeliveryArea';
import DeliveryDashboardSkeleton from './components/DeliveryDashboardSkeleton';
import { fetchRmaApplication } from '../Application/utils/applicationApi';

import {
  fetchDeliveryDashboard,
  updateDeliveryAvailability,
} from './utils/deliveryDashboardApi';

import {
  getPartnerName,
  calculateTodayEarnings,
} from './utils/deliveryDashboardHelpers';

const INITIAL_DASHBOARD = {
  today: {
    orders: 0,
    pending: 0,
    completed: 0,
  },
  allTime: {
    delivered: 0,
  },
  orders: {
    today: [],
    pending: [],
    completedToday: [],
    allDelivered: [],
  },
  activeOrders: [],
  workload: {
    active: 0,
    maximum: 6,
    availableSlots: 6,
  },
};

function DeliveryDashboard() {
  const navigate = useNavigate();

  const [deliveryPartner, setDeliveryPartner] = useState(null);
  const [dashboard, setDashboard] = useState(INITIAL_DASHBOARD);
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingAvailability, setUpdatingAvailability] = useState(false);
  const [error, setError] = useState('');

  const [applicationNotice, setApplicationNotice] = useState(null);
  const [checkingApplication, setCheckingApplication] = useState(false);

  const loadDashboard = useCallback(
    async ({ showLoader = false } = {}) => {
      const token = localStorage.getItem('delivery_token');

      if (!token) {
        navigate('/delivery/rma-login');
        return;
      }

      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      try {
        const data = await fetchDeliveryDashboard(token);

        setDashboard({
          today: {
            orders: data.today?.orders ?? 0,
            pending: data.today?.pending ?? 0,
            completed: data.today?.completed ?? 0,
          },
          allTime: {
            delivered: data.allTime?.delivered ?? 0,
          },
          orders: {
            today: data.orders?.today ?? [],
            pending: data.orders?.pending ?? [],
            completedToday: data.orders?.completedToday ?? [],
            allDelivered: data.orders?.allDelivered ?? [],
          },
          activeOrders: data.activeOrders ?? [],
          workload: {
            active: data.workload?.active ?? data.activeOrders?.length ?? 0,
            maximum: data.workload?.maximum ?? 6,
            availableSlots:
              data.workload?.availableSlots ??
              Math.max(0, 6 - (data.activeOrders?.length ?? 0)),
          },
        });

        setError('');
      } catch (fetchError) {
        console.error('Fetch delivery dashboard failed:', fetchError);
        setError(fetchError.message || 'Unable to load dashboard');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [navigate],
  );

  useEffect(() => {
    const token = localStorage.getItem('delivery_token');

    if (!token) {
      navigate('/delivery/rma-login');
      return undefined;
    }

    const storedPartner = localStorage.getItem('delivery_person');

    if (storedPartner) {
      try {
        const parsedPartner = JSON.parse(storedPartner);
        setDeliveryPartner(parsedPartner);
        setIsOnline(
          ['AVAILABLE', 'BUSY'].includes(parsedPartner?.availabilityStatus),
        );
      } catch (parseError) {
        console.error('Failed to parse delivery partner:', parseError);
      }
    }

    loadDashboard({ showLoader: true });

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadDashboard();
      }
    }, 10000);

    return () => window.clearInterval(intervalId);
  }, [navigate, loadDashboard]);

  const partnerName = getPartnerName(deliveryPartner);

  const todayEarnings = calculateTodayEarnings(dashboard.orders.completedToday);

  const handleToggleOnline = async () => {
    if (updatingAvailability || checkingApplication) return;

    const token = localStorage.getItem('delivery_token');

    if (!token) {
      navigate('/delivery/rma-login');
      return;
    }

    // Only check application eligibility when trying to go online.
    if (!isOnline) {
      try {
        setError('');
        setCheckingApplication(true);

        // Fetch the latest application status from the backend.
        const application = await fetchRmaApplication();
        const status = application?.applicationStatus;

        if (status !== 'APPROVED') {
          const notices = {
            INCOMPLETE: {
              title: 'Complete Your Application',
              message:
                'Please complete your personal details and upload all required documents before going online.',
              action: 'Complete Application',
            },
            SUBMITTED: {
              title: 'Application Under Review',
              message:
                'Your application has been submitted. RMA must approve it before you can receive delivery assignments.',
              action: 'View Application',
            },
            UNDER_REVIEW: {
              title: 'Application Under Review',
              message:
                'RMA is reviewing your details and documents. You can go online after your application is approved.',
              action: 'View Application',
            },
            CORRECTION_REQUIRED: {
              title: 'Changes Required',
              message:
                application?.correctionReason ||
                'Please correct the requested details and resubmit your application.',
              action: 'Update Application',
            },
            REJECTED: {
              title: 'Application Rejected',
              message:
                application?.rejectionReason ||
                'Your application was rejected. Please contact RMA support for guidance.',
              action: 'View Application',
            },
          };

          setApplicationNotice(
            notices[status] || {
              title: 'Application Approval Required',
              message:
                'Your application status could not be confirmed as approved. Please check your application before going online.',
              action: 'View Application',
            },
          );

          return;
        }

        // Keep the latest status locally as well.
        const storedPartner = localStorage.getItem('delivery_person');

        if (storedPartner) {
          const parsedPartner = JSON.parse(storedPartner);
          const updatedPartner = {
            ...parsedPartner,
            applicationStatus: 'APPROVED',
          };

          localStorage.setItem(
            'delivery_person',
            JSON.stringify(updatedPartner),
          );

          setDeliveryPartner(updatedPartner);
        }
      } catch (applicationError) {
        console.error('Unable to verify DP application:', applicationError);

        setApplicationNotice({
          title: 'Unable to Verify Application',
          message:
            'We could not verify your application status. Please try again before going online.',
          action: 'Open Application',
        });

        return;
      } finally {
        setCheckingApplication(false);
      }
    }

    const nextStatus = isOnline ? 'OFFLINE' : 'AVAILABLE';

    try {
      setError('');
      setUpdatingAvailability(true);

      const data = await updateDeliveryAvailability(token, nextStatus);
      const available = ['AVAILABLE', 'BUSY'].includes(data.availabilityStatus);

      setIsOnline(available);

      const storedPartner = localStorage.getItem('delivery_person');

      if (storedPartner) {
        try {
          const parsedPartner = JSON.parse(storedPartner);

          const updatedPartner = {
            ...parsedPartner,
            availabilityStatus: data.availabilityStatus,
          };

          localStorage.setItem(
            'delivery_person',
            JSON.stringify(updatedPartner),
          );

          setDeliveryPartner(updatedPartner);
        } catch (parseError) {
          console.error(
            'Failed to update stored delivery partner:',
            parseError,
          );
        }
      }

      await loadDashboard();
    } catch (toggleError) {
      console.error('Update delivery availability failed:', toggleError);
      setError(toggleError.message || 'Unable to update availability');
    } finally {
      setUpdatingAvailability(false);
    }
  };

  return (
    <main className="delivery_dashboard">
      <DeliveryDashboardHeader partnerName={partnerName} isOnline={isOnline} />

      <DeliveryStatusCard isOnline={isOnline} onToggle={handleToggleOnline} />

      {applicationNotice && (
        <div
          className="dp_application_modal_overlay"
          onClick={() => setApplicationNotice(null)}
        >
          <section
            className="dp_application_modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dp_application_modal_title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="dp_application_modal_icon">!</div>

            <h2 id="dp_application_modal_title">{applicationNotice.title}</h2>

            <p>{applicationNotice.message}</p>

            <button
              type="button"
              className="dp_application_modal_primary"
              onClick={() => {
                setApplicationNotice(null);
                navigate('/delivery/rma/application');
              }}
            >
              {applicationNotice.action}
            </button>

            <button
              type="button"
              className="dp_application_modal_secondary"
              onClick={() => setApplicationNotice(null)}
            >
              Not now
            </button>
          </section>
        </div>
      )}

      {loading ? (
        <DeliveryDashboardSkeleton />
      ) : (
        <>
          {error && (
            <section className="delivery_empty_card" role="alert">
              <strong>{error}</strong>
              <p>Please try refreshing the dashboard.</p>
              <button
                className="delivery_dashboard_retry"
                type="button"
                onClick={() => loadDashboard({ showLoader: true })}
              >
                Retry
              </button>
            </section>
          )}

          <DeliverySummary
            todayEarnings={todayEarnings}
            today={dashboard.today}
          />

          <section className="delivery_section">
            <div className="delivery_section_header">
              <div>
                <h2>Delivery workload</h2>
                <span>Accepted orders across your current trip</span>
              </div>

              <strong className="delivery_workload_count">
                {dashboard.workload.active}/{dashboard.workload.maximum}
              </strong>
            </div>

            <p className="delivery_workload_info">
              {dashboard.workload.availableSlots} order
              {dashboard.workload.availableSlots === 1 ? '' : 's'} of capacity
              remaining
            </p>

            {refreshing && (
              <span className="delivery_workload_refresh">
                Updating deliveries…
              </span>
            )}
          </section>

          <ActiveDelivery
            activeDelivery={dashboard.activeOrders?.[0] || null}
            activeOrders={dashboard.activeOrders || []}
            onViewDelivery={(orderId) =>
              navigate(
                `/delivery/orders-delivery?orderId=${encodeURIComponent(orderId)}`,
              )
            }
          />

          <DeliveryRequests
            pending={dashboard.today.pending}
            completed={dashboard.today.completed}
          />

          <DeliveryArea
            todayOrders={dashboard.today.orders}
            activeCount={dashboard.workload.active}
            maxOrders={dashboard.workload.maximum}
          />
        </>
      )}
    </main>
  );
}

export default DeliveryDashboard;
