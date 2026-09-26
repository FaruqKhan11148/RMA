function OrderDetailsTimeline({ timelineSteps, formatDateTime, formatTime }) {
  return (
    <section className="admin-order-card">
      <div className="admin-order-card-header">
        <div>
          <h2>Order Timeline</h2>
          <p>Complete order status history.</p>
        </div>
      </div>

      <div className="admin-order-timeline">
        {timelineSteps.map((step, index) => (
          <div
            className={`admin-timeline-step ${
              step.completed ? 'completed' : ''
            }`}
            key={step.title}
          >
            <div className="admin-timeline-marker">
              {step.completed ? '✓' : ''}
            </div>

            <div className="admin-timeline-content">
              <strong>{step.title}</strong>

              <span>
                {step.timestamp
                  ? `${formatDateTime(
                      step.timestamp,
                    )} (${formatTime(step.timestamp)})`
                  : 'Not reached yet'}
              </span>
            </div>

            {index < timelineSteps.length - 1 && (
              <div className="admin-timeline-line" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default OrderDetailsTimeline;
