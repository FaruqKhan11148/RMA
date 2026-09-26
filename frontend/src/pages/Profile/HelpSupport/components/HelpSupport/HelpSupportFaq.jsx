function HelpSupportFaq({ faqs, openFaq, toggleFaq }) {
  return (
    <section className="help_support_section">
      <div className="help_support_section_heading">
        <h2>Frequently Asked Questions</h2>

        <p>Find quick answers to common questions.</p>
      </div>

      <div className="faq_list">
        {faqs.map((faq, index) => {
          const isOpen = openFaq === index;

          return (
            <div className={isOpen ? 'faq_item open' : 'faq_item'} key={index}>
              <button className="faq_question" onClick={() => toggleFaq(index)}>
                <span>{faq.question}</span>

                <span className="faq_arrow">{isOpen ? '−' : '+'}</span>
              </button>

              {isOpen && (
                <div className="faq_answer">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default HelpSupportFaq;
