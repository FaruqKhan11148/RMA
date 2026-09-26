function DeliveryPersonEditForm({
  editName,
  setEditName,
  editPhone,
  setEditPhone,
  handleUpdateDetails,
  updatingDetails,
  setEditing,
  setError,
  setSuccessMessage,
}) {
  return (
    <>
      <h2>Edit Delivery Person</h2>

      <form onSubmit={handleUpdateDetails}>
        <div>
          <label>Delivery Person Name</label>

          <input
            type="text"
            value={editName}
            placeholder="Enter full name"
            onChange={(event) => {
              setEditName(event.target.value);
              setError('');
              setSuccessMessage('');
            }}
          />
        </div>

        <div>
          <label>Phone Number</label>

          <input
            type="tel"
            inputMode="numeric"
            maxLength="10"
            value={editPhone}
            placeholder="Enter 10-digit phone number"
            onChange={(event) => {
              setEditPhone(event.target.value.replace(/\D/g, ''));

              setError('');
              setSuccessMessage('');
            }}
          />
        </div>

        <button type="submit" disabled={updatingDetails}>
          {updatingDetails ? 'Saving...' : 'Save Changes'}
        </button>

        <button
          type="button"
          onClick={() => {
            setEditing(false);
            setEditName('');
            setEditPhone('');
            setError('');
            setSuccessMessage('');
          }}
          disabled={updatingDetails}
        >
          Cancel
        </button>
      </form>
    </>
  );
}

export default DeliveryPersonEditForm;
