function PersonalDetailsHeader({ navigate }) {
  return (
    <header className="personal_details_header">
      <button
        className="personal_details_back"
        onClick={() => navigate('/profile')}
      >
        ←
      </button>

      <div>
        <h1>Personal Details</h1>
        <p>Manage your account information</p>
      </div>
    </header>
  );
}

export default PersonalDetailsHeader;
