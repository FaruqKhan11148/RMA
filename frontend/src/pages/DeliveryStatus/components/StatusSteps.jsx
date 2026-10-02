import { statusSteps, statusOrder } from '../utils/deliveryStatusHelpers';

function StatusSteps({ order }) {
  const currentStatusIndex = statusOrder.indexOf(order.status);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';

    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) return '';

    return date.toLocaleString([], {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatEstimatedArrival = (timestamp) => {
    if (!timestamp) return '';

    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) return '';

    return date.toLocaleString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStepTimestamp = (status) => {
    switch (status) {
      case 'Pending':
        return order.createdAt;

      case 'Accepted':
        return order.acceptedAt;

      case 'Preparing':
        return order.preparingAt;

      case 'Ready':
        return order.readyAt;

      case 'OutForDelivery':
        return order.collectedAt;

      case 'Completed':
        return order.completedAt;

      default:
        return null;
    }
  };

  return (
    <div className="status_steps">
      {statusSteps.map((step, index) => {
        const isCompleted = index < currentStatusIndex;
        const isCurrent = index === currentStatusIndex;

        const timestamp = getStepTimestamp(step.status);

        const estimatedDeliveryMinutes = Number(
          order.estimatedDeliveryMinutes || 0,
        );

        const estimatedDeliveryAt = order.estimatedDeliveryAt;

        const showEstimatedArrival =
          step.status === 'OutForDelivery' &&
          order.status === 'OutForDelivery' &&
          order.deliveryPickupStatus === 'COLLECTED' &&
          estimatedDeliveryMinutes > 0 &&
          estimatedDeliveryAt;

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

              {timestamp && (
                <small className="status_step_timestamp">
                  {formatTimestamp(timestamp)}
                </small>
              )}

              {showEstimatedArrival && (
                <div className="status_step_eta">
                  <strong>Estimated arrival</strong>

                  <span>
                    Around {formatEstimatedArrival(estimatedDeliveryAt)}
                  </span>

                  <small>About {estimatedDeliveryMinutes} min</small>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default StatusSteps;
