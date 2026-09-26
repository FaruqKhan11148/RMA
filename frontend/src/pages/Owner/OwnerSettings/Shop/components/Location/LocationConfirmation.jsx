function LocationConfirmation({ shopLocation }) {
  return (
    <>
      {!shopLocation && (
        <div className="owner_location_required">
          Please select your shop location before saving.
        </div>
      )}

      {shopLocation && (
        <div className="owner_location_confirmation">
          <strong>Shop location selected</strong>

          {shopLocation.address && <span>{shopLocation.address}</span>}

          <small>
            {shopLocation.latitude.toFixed(6)}
            {', '}
            {shopLocation.longitude.toFixed(6)}
          </small>
        </div>
      )}
    </>
  );
}

export default LocationConfirmation;
