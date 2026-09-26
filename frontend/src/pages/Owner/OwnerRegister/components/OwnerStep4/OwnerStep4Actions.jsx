function OwnerStep4Actions({ error, loading, handleBack, handleCreateShop }) {
  return (
    <>
      {error && <p className="owner_step4_error">{error}</p>}

      <div className="owner_step4_actions">
        <button
          type="button"
          className="step_back_button"
          onClick={handleBack}
          disabled={loading}
        >
          Back
        </button>

        <button
          type="button"
          className="step_continue_button"
          onClick={handleCreateShop}
          disabled={loading}
        >
          {loading ? 'Creating Shop...' : 'Submit & Create Shop'}
        </button>
      </div>
    </>
  );
}

export default OwnerStep4Actions;
