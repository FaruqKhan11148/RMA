function SettingsOption({ item, navigate }) {
  return (
    <button className="settings-option" onClick={() => navigate(item.path)}>
      <div className="option-content">
        <h3>{item.title}</h3>
        <p>{item.description}</p>
      </div>

      <span className="option-arrow">›</span>
    </button>
  );
}

export default SettingsOption;
