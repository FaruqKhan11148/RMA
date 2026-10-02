function ApplicationSectionCard({
  number,
  title,
  description,
  completed,
  status,
  onClick,
}) {
  return (
    <button
      type="button"
      className={`delivery_application_section ${completed ? 'completed' : ''}`}
      onClick={onClick}
    >
      <div className="delivery_application_section_number">
        {completed ? '✓' : number}
      </div>

      <div className="delivery_application_section_content">
        <strong>{title}</strong>

        <span>{description}</span>
      </div>

      <div className="delivery_application_section_action">
        {completed ? 'Edit' : status || 'Complete'}
        <span>›</span>
      </div>
    </button>
  );
}

export default ApplicationSectionCard;
