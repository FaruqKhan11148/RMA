import './Contact.css';

import { useNavigate } from 'react-router-dom';

import ContactHeader from './components/ContactHeader';
import ContactIntro from './components/ContactIntro';
import CustomerSupport from './components/CustomerSupport';
import ShopOwners from './components/ShopOwners';
import MoreHelp from './components/MoreHelp';
import ContactBusinessCard from './components/ContactBusinessCard';

function Contact() {
  const navigate = useNavigate();

  return (
    <main className="contact_page">
      <ContactHeader onBack={() => navigate(-1)} />

      <div className="contact_container">
        <ContactIntro />

        <CustomerSupport />

        <ShopOwners onPartner={() => navigate('/owner/register/step-1')} />

        <MoreHelp onHelp={() => navigate('/profile/help-support')} />

        <ContactBusinessCard />
      </div>
    </main>
  );
}

export default Contact;
