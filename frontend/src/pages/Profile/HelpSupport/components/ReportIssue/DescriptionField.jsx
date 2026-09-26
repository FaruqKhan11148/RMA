function DescriptionField({ description, setDescription }) {
  return (
    <div className="report_issue_field">
      <label htmlFor="description">Describe the problem</label>

      <textarea
        id="description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Please explain what happened..."
        maxLength="1000"
        rows="7"
      />

      <span className="report_issue_character_count">
        {description.length}/1000
      </span>
    </div>
  );
}

export default DescriptionField;
