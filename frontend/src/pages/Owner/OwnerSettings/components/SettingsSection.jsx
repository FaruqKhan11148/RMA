import SettingsOption from './SettingsOption';

function SettingsSection({ section, navigate }) {
  return (
    <section className="settings-section">
      <div className="section-heading">
        <h2>{section.title}</h2>
        <p>{section.description}</p>
      </div>

      <div className="settings-options">
        {section.items.map((item) => (
          <SettingsOption key={item.path} item={item} navigate={navigate} />
        ))}
      </div>
    </section>
  );
}

export default SettingsSection;
