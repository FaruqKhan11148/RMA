import './HelpSupport.css';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import HelpSupportHeader from './components/HelpSupport/HelpSupportHeader';
import HelpSupportFaq from './components/HelpSupport/HelpSupportFaq';
import HelpSupportContact from './components/HelpSupport/HelpSupportContact';
import HelpSupportReport from './components/HelpSupport/HelpSupportReport';

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
      <HelpSupportHeader navigate={navigate} />

      <HelpSupportFaq faqs={faqs} openFaq={openFaq} toggleFaq={toggleFaq} />

      <HelpSupportContact />

      <HelpSupportReport navigate={navigate} />
    </main>
  );
}

export default HelpSupport;
