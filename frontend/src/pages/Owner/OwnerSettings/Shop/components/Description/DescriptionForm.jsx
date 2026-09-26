function DescriptionForm({
  description,
  setDescription,
  error,
  success,
  saving,
  handleSubmit,
}) {
  return (
    <form onSubmit={handleSubmit}>
      <label className="owner_setting_label">
        Description
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Example: Fresh chicken and meat available daily."
          maxLength={500}
          rows={6}
        />
      </label>

      <div className="owner_description_counter">{description.length}/500</div>

      {error && <p className="owner_setting_error">{error}</p>}

      {success && <p className="owner_setting_success">{success}</p>}

      <button type="submit" className="owner_setting_save" disabled={saving}>
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  );
}

export default DescriptionForm;
