function MoreHelp({ onHelp }) {
  return (
    <section className="contact_section">
      <div className="contact_section_heading">
        <h2>Need More Help?</h2>

        <p>
          Check our frequently asked questions or report an issue with your
          order.
        </p>
      </div>

      <button className="contact_action_button" onClick={onHelp}>
        <span>Visit Help & Support</span>

        <span>›</span>
      </button>
    </section>
  );
}

export default MoreHelp;
