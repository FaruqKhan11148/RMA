function formatRegistrationDate(value) {
  if (!value) return 'Date unavailable';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return 'Date unavailable';

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function PendingOwnerCard({ owner, onViewDetails }) {
  const shopName = owner.shopName || 'Unnamed shop';
  const ownerName = owner.ownerName || 'Owner name unavailable';

  return (
    <article className="owner_approval_card">
      <div className="owner_approval_card__identity">
        <div className="owner_approval_card__avatar" aria-hidden="true">
          {shopName.charAt(0).toUpperCase()}
        </div>

        <div className="owner_approval_card__main">
          <h3>{shopName}</h3>

          <p className="owner_approval_card__owner">{ownerName}</p>

          <p className="owner_approval_card__meta">
            Shop ID: {owner.shopId || 'Not assigned'}
          </p>
        </div>
      </div>

      <div className="owner_approval_card__contact">
        <span className="owner_approval_card__label">Phone</span>
        <span>{owner.phone || 'Not provided'}</span>

        <span className="owner_approval_card__label">Submitted</span>
        <span>{formatRegistrationDate(owner.createdAt)}</span>
      </div>

      <div className="owner_approval_card__actions">
        <span className="owner_approval_card__status">Pending review</span>

        <button type="button" onClick={onViewDetails}>
          Review registration
        </button>
      </div>
    </article>
  );
}

export default PendingOwnerCard;
