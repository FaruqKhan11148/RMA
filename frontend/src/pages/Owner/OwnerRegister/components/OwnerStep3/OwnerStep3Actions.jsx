function OwnerStep3Actions({ error, handleBack }) {
  return (
    <>
      {error && <p className="owner_step_error">{error}</p>}

      <div className="owner_step_actions">
        <button
          type="button"
          className="owner_step_back_button"
          onClick={handleBack}
        >
          Back
        </button>

        <button className="owner_step_button" type="submit">
          Continue
        </button>
      </div>
    </>
  );
}

export default OwnerStep3Actions;
