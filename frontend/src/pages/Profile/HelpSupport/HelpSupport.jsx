import './HelpSupport.css';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function HelpSupport() {
  const navigate = useNavigate();

  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      question: 'How do I place an order?',
      answer:
        'Find or scan an RMA shop, select the products you want, add them to your cart, and continue to checkout. After completing payment, your order will be sent to the shop.',
    },
    {
      question: 'How can I track my order?',
      answer:
        'You can open the Orders section from your profile or bottom navigation to view your order status and delivery progress.',
    },
    {
      question: 'Can I cancel my order?',
      answer:
        'Order cancellation depends on the current status of your order. If the shop has already started preparing your order, cancellation may no longer be available.',
    },
    {
      question: 'How does delivery work?',
      answer:
        'After the shop accepts and prepares your order, the shop delivery person can collect it and deliver it to your selected location.',
    },
    {
      question: 'How can I change my saved address?',
      answer:
        'Go to Profile → Saved Addresses. From there you can add, edit, delete, or change your default delivery address.',
    },
    {
      question: 'What if there is a problem with my order?',
      answer:
        'If something is wrong with your order, use the Report an Issue option below and provide your order details and a description of the problem.',
    },
  ];

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <main className="help_support_page">
      {/* HEADER */}

      <div className="help_support_header">
        <button
          className="help_support_back"
          onClick={() => navigate('/profile')}
        >
          ‹
        </button>

        <h1>Help & Support</h1>
      </div>

      {/* FAQ */}

      <section className="help_support_section">
        <div className="help_support_section_heading">
          <h2>Frequently Asked Questions</h2>

          <p>Find quick answers to common questions.</p>
        </div>

        <div className="faq_list">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;

            return (
              <div
                className={isOpen ? 'faq_item open' : 'faq_item'}
                key={index}
              >
                <button
                  className="faq_question"
                  onClick={() => toggleFaq(index)}
                >
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

      {/* CONTACT */}

      <section className="help_support_section">
        <div className="help_support_section_heading">
          <h2>Contact RMA</h2>

          <p>Need help from our support team?</p>
        </div>

        <div className="support_contact_list">
          <a className="support_contact_item" href="tel:+919999999999">
            <div className="support_contact_icon">☎</div>

            <div className="support_contact_text">
              <strong>Call Support</strong>

              <span>Speak with RMA support</span>
            </div>

            <span className="support_contact_arrow">›</span>
          </a>

          <a className="support_contact_item" href="mailto:support@rma.com">
            <div className="support_contact_icon">@</div>

            <div className="support_contact_text">
              <strong>Email Support</strong>

              <span>Send us your question</span>
            </div>

            <span className="support_contact_arrow">›</span>
          </a>
        </div>
      </section>

      {/* REPORT ISSUE */}

      <section className="help_support_section">
        <div className="help_support_section_heading">
          <h2>Report an Issue</h2>

          <p>Something went wrong? Let us know.</p>
        </div>

        <button
          className="report_issue_button"
          onClick={() => navigate('/profile/help-support/report')}
        >
          <span>Report a problem</span>

          <span>›</span>
        </button>
      </section>
    </main>
  );
}

export default HelpSupport;
