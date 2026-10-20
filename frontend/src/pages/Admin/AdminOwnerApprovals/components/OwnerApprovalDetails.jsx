import { useState } from 'react';

function displayValue(value) {
  if (value === null || value === undefined || value === '') {
    return 'Not provided';
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value);
}

function DetailRow({ label, value }) {
  return (
    <div className="owner_approval_details__row">
      <span>{label}</span>
      <strong>{displayValue(value)}</strong>
    </div>
  );
}

function OwnerLocationMap({ location, address }) {
  const latitude = Number(location?.latitude);
  const longitude = Number(location?.longitude);

  const hasCoordinates =
    location?.latitude !== null &&
    location?.latitude !== undefined &&
    location?.longitude !== null &&
    location?.longitude !== undefined &&
    location?.latitude !== '' &&
    location?.longitude !== '' &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180 &&
    (latitude !== 0 || longitude !== 0);

  if (!hasCoordinates) {
    return (
      <div className="owner_approval_details__map-unavailable">
        <p>Map location was not saved for this shop.</p>
        {address && <p>{address}</p>}
      </div>
    );
  }

  const mapUrl = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=16/${latitude}/${longitude}`;
  const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.01}%2C${latitude - 0.01}%2C${longitude + 0.01}%2C${latitude + 0.01}&layer=mapnik&marker=${latitude}%2C${longitude}`;

  return (
    <div className="owner_approval_details__map">
      <iframe
        title={`Registered location for ${address || 'shop'}`}
        src={embedUrl}
        loading="lazy"
        referrerPolicy="no-referrer"
      />

      <div className="owner_approval_details__coordinates">
        <span>Latitude: {latitude}</span>
        <span>Longitude: {longitude}</span>
      </div>

      <a href={mapUrl} target="_blank" rel="noreferrer">
        Open location in OpenStreetMap
      </a>

      {address && (
        <p className="owner_approval_details__map-address">{address}</p>
      )}
    </div>
  );
}

function OwnerApprovalDetails({
  owner,
  loading,
  onClose,
  onApprove,
  onReject,
}) {
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [reason, setReason] = useState('');
  const [validationError, setValidationError] = useState('');

  const payment = owner.payment || {};
  const location = owner.location || {};

  const submitRejection = () => {
    const trimmedReason = reason.trim();

    if (!trimmedReason) {
      setValidationError('Please enter a reason for rejection.');
      return;
    }

    setValidationError('');
    onReject(trimmedReason);
  };

  return (
    <div
      className="owner_approval_details__overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onClose();
        }
      }}
    >
      <section
        className="owner_approval_details"
        role="dialog"
        aria-modal="true"
        aria-labelledby="owner-approval-details-title"
      >
        <header className="owner_approval_details__header">
          <div>
            <span className="owner_approval_details__eyebrow">
              REGISTRATION REVIEW
            </span>

            <h2 id="owner-approval-details-title">
              {owner.shopName || 'Shop details'}
            </h2>

            <p>Review the submitted information before making a decision.</p>
          </div>

          <button
            type="button"
            className="owner_approval_details__close"
            onClick={onClose}
            disabled={loading}
            aria-label="Close details"
          >
            ×
          </button>
        </header>

        <div className="owner_approval_details__content">
          <section className="owner_approval_details__section">
            <h3>Owner information</h3>

            <DetailRow label="Owner name" value={owner.ownerName} />
            <DetailRow label="Phone" value={owner.phone} />
            <DetailRow label="Email" value={owner.email} />
          </section>

          <section className="owner_approval_details__section">
            <h3>Shop information</h3>

            <DetailRow label="Shop name" value={owner.shopName} />
            <DetailRow label="Shop ID" value={owner.shopId} />
            <DetailRow label="Address" value={owner.address} />
            <DetailRow label="Description" value={owner.description} />
            <DetailRow label="Location" value={location} />
            <DetailRow label="Delivery available" value={owner.delivery} />
            <DetailRow label="Pickup available" value={owner.pickup} />
          </section>

          <OwnerLocationMap location={owner.location} address={owner.address} />

          <section className="owner_approval_details__section">
            <h3>UPI payment details</h3>

            <DetailRow label="Payment provider" value={payment.provider} />
            <DetailRow
              label="UPI account holder"
              value={payment.upiAccountHolderName}
            />
            <DetailRow
              label="UPI mobile number"
              value={payment.upiMobileNumber}
            />
            <DetailRow label="UPI ID" value={payment.upiId} />
            <DetailRow
              label="Approval status"
              value={payment.rmaApprovalStatus}
            />
          </section>

          <section className="owner_approval_details__section">
            <h3>Submitted products</h3>

            {Array.isArray(owner.products) && owner.products.length > 0 ? (
              <div className="owner_approval_details__products">
                {owner.products.map((product, index) => (
                  <div
                    className="owner_approval_details__product"
                    key={product._id || product.productId || index}
                  >
                    <span>{product.name || 'Unnamed product'}</span>
                    <strong>
                      {product.price === undefined
                        ? 'Price unavailable'
                        : `₹${product.price}`}
                      {product.unit ? ` / ${product.unit}` : ''}
                    </strong>
                  </div>
                ))}
              </div>
            ) : (
              <p className="owner_approval_details__muted">
                No product information was returned.
              </p>
            )}
          </section>

          {!showRejectForm ? (
            <div className="owner_approval_details__actions">
              <button
                type="button"
                className="owner_approval_details__reject"
                onClick={() => setShowRejectForm(true)}
                disabled={loading}
              >
                Reject registration
              </button>

              <button
                type="button"
                className="owner_approval_details__approve"
                onClick={onApprove}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Approve shop'}
              </button>
            </div>
          ) : (
            <section className="owner_approval_details__reject-form">
              <h3>Reason for rejection</h3>

              <p>
                Enter a clear reason for the decision. Confirm that the details
                are accurate before rejecting this registration.
              </p>

              <textarea
                value={reason}
                onChange={(event) => {
                  setReason(event.target.value);
                  setValidationError('');
                }}
                placeholder="Explain why this shop registration is being rejected..."
                rows={4}
                maxLength={1000}
                disabled={loading}
              />

              {validationError && (
                <p className="owner_approval_details__validation">
                  {validationError}
                </p>
              )}

              <div className="owner_approval_details__actions">
                <button
                  type="button"
                  className="owner_approval_details__secondary"
                  onClick={() => {
                    setShowRejectForm(false);
                    setValidationError('');
                  }}
                  disabled={loading}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="owner_approval_details__reject"
                  onClick={submitRejection}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Confirm rejection'}
                </button>
              </div>
            </section>
          )}
        </div>
      </section>
    </div>
  );
}

export default OwnerApprovalDetails;
