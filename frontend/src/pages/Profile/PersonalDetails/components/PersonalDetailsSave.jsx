function PersonalDetailsSave({ saving }) {
  return (
    <button type="submit" className="personal_details_save" disabled={saving}>
      {saving ? 'Saving...' : 'Save Changes'}
    </button>
  );
}

export default PersonalDetailsSave;
