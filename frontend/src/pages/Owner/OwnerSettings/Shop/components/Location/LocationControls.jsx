function LocationControls({ handleUseCurrentLocation, saving }) {
  return (
    <>
      <div className="owner_location_info">
        <strong>Shop Location</strong>

        <span>
          Move the marker or tap anywhere on the map to select your exact shop
          location.
        </span>
      </div>
    </>
  );
}

export default LocationControls;
