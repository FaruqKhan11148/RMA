import { statusSteps, statusOrder } from '../utils/deliveryStatusHelpers';

function StatusSteps({ currentStatus }) {
  const currentStatusIndex = statusOrder.indexOf(currentStatus);

  return (
    <div className="status_steps">
      {statusSteps.map((step, index) => {
        const isCompleted = index < currentStatusIndex;

        const isCurrent = index === currentStatusIndex;

        return (
          <div
            className={`status_step ${
              isCompleted ? 'completed' : ''
            } ${isCurrent ? 'current' : ''}`}
            key={step.status}
          >
            <span className="status_step_icon">
              {isCurrent && step.status === 'OutForDelivery' ? (
                <svg
                  viewBox="0 0 64 64"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <circle
                    cx="18"
                    cy="46"
                    r="7"
                    stroke="currentColor"
                    strokeWidth="4"
                  />

                  <circle
                    cx="47"
                    cy="46"
                    r="7"
                    stroke="currentColor"
                    strokeWidth="4"
                  />

                  <path
                    d="M25 46H40L35 30H25L18 46"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  <path
                    d="M35 30H43L50 38V46H40"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  <path
                    d="M31 24L35 30"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />

                  <path
                    d="M43 38H50"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              ) : isCompleted ? (
                '✓'
              ) : isCurrent ? (
                '✓'
              ) : (
                index + 1
              )}
            </span>

            <div>
              <strong>{step.title}</strong>

              <p>{step.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default StatusSteps;
