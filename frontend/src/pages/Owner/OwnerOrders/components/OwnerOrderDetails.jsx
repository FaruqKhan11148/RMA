import { useCallback, useEffect, useState } from 'react';
import OrderLocationMap from '../../../../components/map/OrderLocationMap';
import {
  fetchOwnerRefundRequests,
  markOwnerRefundAsSent,
} from '../utils/ownerOrdersApi';

function OwnerOrderDetails({ order, setSelectedOrder }) {
  const [refunds, setRefunds] = useState([]);
  const [refundLoading, setRefundLoading] = useState(true);
  const [refundError, setRefundError] = useState('');
  const [submittingRefundId, setSubmittingRefundId] = useState('');
  const [refundSuccess, setRefundSuccess] = useState('');
  const [refundForms, setRefundForms] = useState({});

  const loadRefunds = useCallback(async () => {
    setRefundLoading(true);
    setRefundError('');

    try {
      const data = await fetchOwnerRefundRequests(order.orderId);
      setRefunds(data);
    } catch (error) {
      setRefundError(error.message || 'Unable to load refund requests.');
    } finally {
      setRefundLoading(false);
    }
  }, [order.orderId]);

  useEffect(() => {
    loadRefunds();
  }, [loadRefunds]);

  const updateRefundForm = (refundId, field, value) => {
    setRefundForms((current) => ({
      ...current,
      [refundId]: {
        ...current[refundId],
        [field]: value,
      },
    }));
  };

  const handleRefundSubmit = async (refund) => {
    const form = refundForms[refund._id] || {};

    if (
      !form.reference?.trim() ||
      !form.evidenceUrl?.trim() ||
      !form.refundSentAt
    ) {
      setRefundError(
        'Enter the transaction reference, evidence URL, and actual transfer date and time.',
      );
      return;
    }

    let evidenceUrl;

    try {
      evidenceUrl = new URL(form.evidenceUrl.trim());

      if (evidenceUrl.protocol !== 'https:') {
        throw new Error('HTTPS is required.');
      }
    } catch {
      setRefundError('Enter a valid HTTPS evidence URL.');
      return;
    }

    const sentAt = new Date(form.refundSentAt);

    if (Number.isNaN(sentAt.getTime())) {
      setRefundError('Enter a valid transfer date and time.');
      return;
    }

    if (sentAt.getTime() > Date.now() + 5 * 60 * 1000) {
      setRefundError('Transfer date and time cannot be in the future.');
      return;
    }

    setSubmittingRefundId(refund._id);
    setRefundError('');
    setRefundSuccess('');

    try {
      const result = await markOwnerRefundAsSent(order.orderId, refund._id, {
        reference: form.reference.trim(),
        evidenceUrl: evidenceUrl.toString(),
        refundSentAt: sentAt.toISOString(),
        reason: form.reason?.trim() || '',
      });

      if (result.refund) {
        setRefunds((current) =>
          current.map((item) =>
            item._id === refund._id ? result.refund : item,
          ),
        );
      } else {
        await loadRefunds();
      }

      setRefundSuccess(
        result.message ||
          'Transfer details submitted. Awaiting admin verification.',
      );
      setRefundForms((current) => ({
        ...current,
        [refund._id]: {},
      }));
    } catch (error) {
      setRefundError(
        error.message || 'Unable to submit refund transfer details.',
      );
    } finally {
      setSubmittingRefundId('');
    }
  };

  const formatDate = (value) => {
    if (!value) return '—';

    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString();
  };

  return (
    <section className="owner_order_details">
      <div className="owner_order_details_header">
        <button
          type="button"
          className="owner_order_details_back"
          onClick={() => setSelectedOrder(null)}
        >
          ← Back to Orders
        </button>

        <div>
          <h1>Order #{order.orderId}</h1>

          <span
            className={`order_status ${order.status
              .toLowerCase()
              .replace(/([a-z])([A-Z])/g, '$1-$2')}`}
          >
            {order.status}
          </span>
        </div>
      </div>

      <section className="owner_order_details_section">
        <h2>Customer</h2>

        <div className="owner_order_details_rows">
          <div>
            <span>Name</span>
            <strong>{order.customer?.name || '—'}</strong>
          </div>

          <div>
            <span>Phone</span>
            <strong>{order.customer?.phone || '—'}</strong>
          </div>
        </div>
      </section>

      <section className="owner_order_details_section">
        <h2>Order Information</h2>

        <div className="owner_order_details_rows">
          <div>
            <span>Order Type</span>
            <strong>
              {order.orderType === 'delivery' ? 'Delivery' : 'Pickup'}
            </strong>
          </div>

          {order.orderType === 'delivery' && order.deliveryDistance != null && (
            <div>
              <span>Delivery Distance</span>
              <strong>{Number(order.deliveryDistance).toFixed(2)} KM</strong>
            </div>
          )}

          <div>
            <span>Placed On</span>
            <strong>{formatDate(order.createdAt)}</strong>
          </div>
        </div>
      </section>

      {order.orderType === 'delivery' && (
        <section className="owner_order_details_section">
          <h2>Delivery Address</h2>

          <div className="owner_order_address">
            <span>Address</span>
            <strong>{order.deliveryLocation?.address || '—'}</strong>
          </div>

          {order.deliveryLocation?.latitude != null &&
            order.deliveryLocation?.longitude != null && (
              <div className="owner_order_details_map">
                <OrderLocationMap
                  latitude={Number(order.deliveryLocation.latitude)}
                  longitude={Number(order.deliveryLocation.longitude)}
                />
              </div>
            )}
        </section>
      )}

      <section className="owner_order_details_section">
        <h2>Items</h2>

        <div className="owner_order_details_items">
          {(order.items || []).map((item, index) => (
            <div
              className="owner_order_details_item"
              key={item.productId || `${item.productName}-${index}`}
            >
              <div>
                <strong>{item.productName}</strong>

                <span>
                  {item.quantity} × ₹{Number(item.price || 0).toFixed(2)}
                </span>
              </div>

              <strong>
                ₹
                {(Number(item.price || 0) * Number(item.quantity || 0)).toFixed(
                  2,
                )}
              </strong>
            </div>
          ))}
        </div>
      </section>

      <section className="owner_order_details_section">
        <h2>Price Breakdown</h2>

        <div className="owner_order_price_breakdown">
          <div>
            <span>Subtotal</span>
            <strong>₹{Number(order.subtotal || 0).toFixed(2)}</strong>
          </div>

          <div>
            <span>Delivery Charge</span>
            <strong>₹{Number(order.deliveryCharge || 0).toFixed(2)}</strong>
          </div>

          <div>
            <span>RMA Fee</span>
            <strong>₹{Number(order.rmaFee || 0).toFixed(2)}</strong>
          </div>

          <div className="owner_order_price_total">
            <span>Total</span>
            <strong>₹{Number(order.totalPrice || 0).toFixed(2)}</strong>
          </div>
        </div>
      </section>

      <section className="owner_order_details_section">
        <h2>Payment</h2>

        <div className="owner_order_details_rows">
          <div>
            <span>Status</span>
            <strong>{order.paymentStatus || '—'}</strong>
          </div>

          <div>
            <span>Method</span>
            <strong>{order.paymentMethod || '—'}</strong>
          </div>

          {order.paymentId && (
            <div>
              <span>Payment ID</span>
              <strong>{order.paymentId}</strong>
            </div>
          )}
        </div>
      </section>

      <section className="owner_order_details_section">
        <h2>Refund Requests</h2>

        {refundLoading && <p>Loading refund requests…</p>}

        {!refundLoading && refundError && <p role="alert">{refundError}</p>}

        {!refundLoading && !refundError && refunds.length === 0 && (
          <p>
            {order.status === 'Rejected' &&
            order.paymentProvider === 'DIRECT_UPI' &&
            order.paymentStatus !== 'Paid' ? (
              <>
                This order was rejected, but payment has not been confirmed by
                the shop. No refund is currently due. If the customer has
                already paid, verify the UPI transaction and update the payment
                status first.
              </>
            ) : order.status === 'Rejected' &&
              order.paymentStatus === 'Paid' ? (
              <>
                This order was rejected after payment. No refund record was
                found. Please contact the admin to review the refund.
              </>
            ) : (
              'No refund requests for this order.'
            )}
          </p>
        )}

        {refundSuccess && <p role="status">{refundSuccess}</p>}

        {refunds.map((refund) => {
          const form = refundForms[refund._id] || {};
          const canSubmit = refund.status === 'APPROVED' && refund.activeRefund;

          return (
            <div
              className="owner_order_refund"
              key={refund._id}
              style={{
                marginTop: '16px',
                padding: '16px',
                border: '1px solid #dfe5df',
                borderRadius: '10px',
              }}
            >
              <div className="owner_order_details_rows">
                <div>
                  <span>Refund Amount</span>
                  <strong>₹{Number(refund.amount || 0).toFixed(2)}</strong>
                </div>

                <div>
                  <span>Status</span>
                  <strong>{refund.status}</strong>
                </div>

                <div>
                  <span>Requested On</span>
                  <strong>{formatDate(refund.createdAt)}</strong>
                </div>
              </div>

              <div style={{ marginTop: '12px' }}>
                <span>Reason</span>
                <p>{refund.reason || 'No reason provided.'}</p>
              </div>

              {refund.shopResponse && (
                <div>
                  <span>Shop Response</span>
                  <p>{refund.shopResponse}</p>
                </div>
              )}

              {refund.refundReference && (
                <div>
                  <span>Transfer Reference</span>
                  <p>{refund.refundReference}</p>
                </div>
              )}

              {refund.refundEvidenceUrl && (
                <div>
                  <a
                    href={refund.refundEvidenceUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View transfer evidence
                  </a>
                </div>
              )}

              {refund.refundSentAt && (
                <div>
                  <span>Transfer Reported On</span>
                  <p>{formatDate(refund.refundSentAt)}</p>
                </div>
              )}

              {refund.verifiedAt && (
                <div>
                  <span>Verified On</span>
                  <p>{formatDate(refund.verifiedAt)}</p>
                </div>
              )}

              {refund.status === 'MARKED_SENT' && (
                <p>Transfer details submitted. Awaiting admin verification.</p>
              )}

              {refund.status === 'VERIFIED' && (
                <p>Admin has verified the refund transfer.</p>
              )}

              {refund.status === 'FAILED' && (
                <p>
                  The submitted refund transfer was marked as failed. Please
                  contact the admin for the next steps.
                </p>
              )}

              {canSubmit && (
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    handleRefundSubmit(refund);
                  }}
                  style={{
                    display: 'grid',
                    gap: '12px',
                    marginTop: '16px',
                  }}
                >
                  <h3>Submit Refund Transfer Details</h3>

                  <p>
                    After you actually transfer the refund to the customer,
                    enter the transaction reference and evidence below. The
                    refund remains pending until admin verification.
                  </p>

                  <label>
                    Actual UPI / Bank Transaction Reference
                    <input
                      type="text"
                      maxLength={200}
                      required
                      value={form.reference || ''}
                      onChange={(event) =>
                        updateRefundForm(
                          refund._id,
                          'reference',
                          event.target.value,
                        )
                      }
                      placeholder="Enter transaction reference"
                    />
                  </label>

                  <label>
                    Transfer Evidence HTTPS URL
                    <input
                      type="url"
                      maxLength={2000}
                      required
                      value={form.evidenceUrl || ''}
                      onChange={(event) =>
                        updateRefundForm(
                          refund._id,
                          'evidenceUrl',
                          event.target.value,
                        )
                      }
                      placeholder="https://..."
                    />
                  </label>

                  <label>
                    Actual Transfer Date and Time
                    <input
                      type="datetime-local"
                      required
                      value={form.refundSentAt || ''}
                      onChange={(event) =>
                        updateRefundForm(
                          refund._id,
                          'refundSentAt',
                          event.target.value,
                        )
                      }
                    />
                  </label>

                  <label>
                    Additional Notes (optional)
                    <textarea
                      value={form.reason || ''}
                      onChange={(event) =>
                        updateRefundForm(
                          refund._id,
                          'reason',
                          event.target.value,
                        )
                      }
                      rows={3}
                      placeholder="Additional information for admin"
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={submittingRefundId === refund._id}
                  >
                    {submittingRefundId === refund._id
                      ? 'Submitting…'
                      : 'Submit Transfer Details'}
                  </button>
                </form>
              )}
            </div>
          );
        })}
      </section>

      <section className="owner_order_details_section">
        <h2>Delivery Partner</h2>

        {order.deliveryPersonId ? (
          <div className="owner_order_delivery_details">
            <div>
              <span>Partner Type</span>
              <strong>
                {order.deliveryAssignmentType === 'RMA'
                  ? 'RMA Delivery Partner'
                  : 'Shop Delivery Partner'}
              </strong>
            </div>

            <div>
              <span>Partner ID</span>
              <strong>{order.deliveryPersonId}</strong>
            </div>

            {order.deliveryPersonName && (
              <div>
                <span>Name</span>
                <strong>{order.deliveryPersonName}</strong>
              </div>
            )}

            {order.deliveryPersonPhone && (
              <div>
                <span>Phone</span>
                <strong>{order.deliveryPersonPhone}</strong>
              </div>
            )}
          </div>
        ) : (
          <div className="owner_order_delivery_unassigned">
            No delivery partner assigned yet.
          </div>
        )}
      </section>

      <section className="owner_order_details_section">
        <h2>Order Timeline</h2>

        <div className="owner_order_timeline">
          <div>
            <span>Created</span>
            <strong>{formatDate(order.createdAt)}</strong>
          </div>

          {order.completedAt && (
            <div>
              <span>Completed</span>
              <strong>{formatDate(order.completedAt)}</strong>
            </div>
          )}
        </div>
      </section>
    </section>
  );
}

export default OwnerOrderDetails;
