import { useNavigate } from 'react-router-dom';
import './RegistrationPending.css';

function RegistrationPending() {
  const navigate = useNavigate();

  return (
    <main className="registration-pending">
      <div className="registration-pending__card">
        <div className="registration-pending__logo">RMA</div>

        <div className="registration-pending__icon" aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
        </div>

        <p className="registration-pending__eyebrow">SHOP REGISTRATION</p>

        <h1>Registration Pending</h1>

        <p className="registration-pending__description">
          Your shop registration has been submitted successfully. Our RMA admin
          team will review your shop and registration details before approving
          it.
        </p>

        <div className="registration-pending__status">
          <span className="registration-pending__status-dot" />
          Awaiting admin approval
        </div>

        <div className="registration-pending__notice">
          <strong>What happens next?</strong>
          <p>
            Once your shop is approved, you can log in to your owner account and
            start managing your shop on RMA.
          </p>
        </div>

        <button
          type="button"
          className="registration-pending__button"
          onClick={() => navigate('/')}
        >
          Back to Home
        </button>

        <p className="registration-pending__footer">
          Fresh. Local. Convenient.
        </p>
      </div>
    </main>
  );
}

export default RegistrationPending;
