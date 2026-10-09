import { useMemo, useState } from 'react';
import { Package, Archive, CalendarDays } from 'lucide-react';

import OwnerEarningsOrderCard from './OwnerEarningsOrderCard';
import OwnerEarningsDetailsModal from './OwnerEarningsDetailsModal';
import { archiveOwnerEarnings } from '../utils/ownerEarningsApi';

function OwnerRecentOrders({
  recentEarnings = [],
  ownerId,
  onArchived,
}) {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [dateFilter, setDateFilter] = useState('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [archiving, setArchiving] = useState(false);
  const [archiveError, setArchiveError] = useState('');
  const [archiveMessage, setArchiveMessage] = useState('');

  const getDate = (value) => {
    if (!value) return null;

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const getSettlementDate = (order) =>
    getDate(order.settledAt);

  const filteredOrders = useMemo(() => {
    const now = new Date();

    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );

    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);

    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - 6);

    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
    );

    const customStartDate = customStart
      ? new Date(`${customStart}T00:00:00`)
      : null;

    const customEndDate = customEnd
      ? new Date(`${customEnd}T23:59:59.999`)
      : null;

    return recentEarnings.filter((order) => {
      const settlementDate = getSettlementDate(order);

      if (dateFilter === 'all') return true;

      // Date-based earnings filters include only settled orders.
      if (
        order.settlementStatus !== 'Settled' ||
        !settlementDate
      ) {
        return false;
      }

      switch (dateFilter) {
        case 'today':
          return settlementDate >= startOfToday &&
            settlementDate <= now;

        case 'yesterday':
          return settlementDate >= startOfYesterday &&
            settlementDate < startOfToday;

        case 'last7':
          return settlementDate >= startOfWeek &&
            settlementDate <= now;

        case 'last30': {
          const start = new Date(startOfToday);
          start.setDate(start.getDate() - 29);

          return settlementDate >= start &&
            settlementDate <= now;
        }

        case 'month':
          return settlementDate >= startOfMonth &&
            settlementDate <= now;

        case 'custom':
          if (
            customStartDate &&
            settlementDate < customStartDate
          ) {
            return false;
          }

          if (
            customEndDate &&
            settlementDate > customEndDate
          ) {
            return false;
          }

          if (
            customStartDate &&
            customEndDate &&
            customStartDate > customEndDate
          ) {
            return false;
          }

          return true;

        default:
          return true;
      }
    });
  }, [
    recentEarnings,
    dateFilter,
    customStart,
    customEnd,
  ]);

  const settledOrders = filteredOrders.filter(
    (order) => order.settlementStatus === 'Settled',
  );

  const filteredSettledEarnings = settledOrders.reduce(
    (total, order) => total + Number(order.ownerAmount || 0),
    0,
  );

  const visibleOrderIds = filteredOrders.map(
    (order) => order.orderId,
  );

  const allVisibleSelected =
    visibleOrderIds.length > 0 &&
    visibleOrderIds.every((id) =>
      selectedOrderIds.includes(id),
    );

  const toggleOrder = (orderId) => {
    setSelectedOrderIds((previous) =>
      previous.includes(orderId)
        ? previous.filter((id) => id !== orderId)
        : [...previous, orderId],
    );

    setArchiveError('');
    setArchiveMessage('');
  };

  const toggleSelectAll = () => {
    setSelectedOrderIds((previous) => {
      if (allVisibleSelected) {
        return previous.filter(
          (id) => !visibleOrderIds.includes(id),
        );
      }

      return [
        ...new Set([...previous, ...visibleOrderIds]),
      ];
    });

    setArchiveError('');
    setArchiveMessage('');
  };

  const handleArchiveSelected = async () => {
    if (!ownerId) {
      setArchiveError('Owner ID is missing. Please reload the page.');
      return;
    }

    if (selectedOrderIds.length === 0) {
      setArchiveError('Select at least one order to archive.');
      return;
    }

    const confirmed = window.confirm(
      `Hide ${selectedOrderIds.length} selected record(s) from Recent Earnings? Original orders and payment records will remain unchanged.`,
    );

    if (!confirmed) return;

    try {
      setArchiving(true);
      setArchiveError('');
      setArchiveMessage('');

      const result = await archiveOwnerEarnings(
        ownerId,
        selectedOrderIds,
      );

      setSelectedOrderIds([]);
      setArchiveMessage(
        result.message || 'Selected records archived successfully.',
      );

      if (onArchived) {
        await onArchived();
      }
    } catch (error) {
      setArchiveError(
        error.message || 'Unable to archive selected records.',
      );
    } finally {
      setArchiving(false);
    }
  };

  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
  };

  return (
    <>
      <section className="owner_earnings_orders">
        <div className="owner_earnings_section_header">
          <h2>Recent Earnings</h2>
        </div>

        <div className="owner-earnings-filters">
          <label htmlFor="earnings-date-filter">
            <CalendarDays size={18} />
            Filter by settlement date
          </label>

          <select
            id="earnings-date-filter"
            value={dateFilter}
            onChange={(event) => setDateFilter(event.target.value)}
          >
            <option value="all">All dates</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="last7">Last 7 days</option>
            <option value="last30">Last 30 days</option>
            <option value="month">This month</option>
            <option value="custom">Custom range</option>
          </select>

          {dateFilter === 'custom' && (
            <div className="owner-earnings-custom-dates">
              <label>
                From
                <input
                  type="date"
                  value={customStart}
                  max={customEnd || undefined}
                  onChange={(event) =>
                    setCustomStart(event.target.value)
                  }
                />
              </label>

              <label>
                To
                <input
                  type="date"
                  value={customEnd}
                  min={customStart || undefined}
                  onChange={(event) =>
                    setCustomEnd(event.target.value)
                  }
                />
              </label>
            </div>
          )}
        </div>

        <div className="owner-earnings-filter-summary">
          <div>
            <span>Matching records</span>
            <strong>{filteredOrders.length}</strong>
          </div>

          <div>
            <span>Settled orders</span>
            <strong>{settledOrders.length}</strong>
          </div>

          <div>
            <span>Filtered settled earnings</span>
            <strong>
              ₹
              {filteredSettledEarnings.toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </strong>
          </div>
        </div>

        {filteredOrders.length > 0 && (
          <div className="owner-earnings-selection-toolbar">
            <label>
              <input
                type="checkbox"
                checked={allVisibleSelected}
                onChange={toggleSelectAll}
              />
              Select all filtered records
            </label>

            <button
              type="button"
              onClick={handleArchiveSelected}
              disabled={
                archiving || selectedOrderIds.length === 0
              }
            >
              <Archive size={17} />
              {archiving
                ? 'Archiving...'
                : `Archive Selected (${selectedOrderIds.length})`}
            </button>
          </div>
        )}

        {archiveError && (
          <p className="owner-earnings-archive-error" role="alert">
            {archiveError}
          </p>
        )}

        {archiveMessage && (
          <p className="owner-earnings-archive-success" role="status">
            {archiveMessage}
          </p>
        )}

        {filteredOrders.length === 0 ? (
          <div className="owner_earnings_empty">
            <Package size={30} />
            <p>No records found for this date filter.</p>
          </div>
        ) : (
          <div className="owner_earnings_order_list">
            {filteredOrders.map((order) => (
              <div
                className="owner-earnings-selectable-order"
                key={order.orderId}
              >
                <label className="owner-earnings-order-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedOrderIds.includes(order.orderId)}
                    onChange={() => toggleOrder(order.orderId)}
                    aria-label={`Select order ${order.orderId}`}
                  />
                </label>

                <div className="owner-earnings-order-card-wrapper">
                  <OwnerEarningsOrderCard
                    order={order}
                    onClick={handleSelectOrder}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {selectedOrder && (
        <OwnerEarningsDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </>
  );
}

export default OwnerRecentOrders;