import './About.css';

import { Info, ShieldCheck, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function About() {
  const navigate = useNavigate();

  return (
    <main className="about_page">
      <section className="about_header">
        <div className="about_logo">RMA</div>

        <h1>About RMA</h1>

        <p className="about_tagline">Raw Meat Application</p>

        <span className="about_version">Web Version 1.0.0</span>
      </section>

      <section className="about_content">
        <div className="about_section">
          <div className="about_section_icon">
            <Info size={20} strokeWidth={2} />
          </div>

          <div>
            <h2>About RMA</h2>

            <p>
              RMA (Raw Meat Application) is a local meat ordering platform
              designed to connect customers with registered local meat shops.
              Customers can discover participating shops, view available
              products, and place orders for delivery.
            </p>

            <p>
              RMA also provides tools for registered shops to manage their
              products, orders, and customer requests through the platform.
            </p>
          </div>
        </div>

        <div className="about_section">
          <div className="about_section_icon">
            <Info size={20} strokeWidth={2} />
          </div>

          <div>
            <h2>How RMA Works</h2>

            <p>
              Customers can find a participating meat shop through RMA, select
              the products they want, provide their required details, and place
              an order for delivery.
            </p>

            <p>
              Each registered shop operates its own shop profile and manages its
              products and orders through RMA.
            </p>
          </div>
        </div>
      </section>

      <section className="about_links">
        <button
          className="about_link"
          onClick={() => navigate('/privacy-policy')}
        >
          <span className="about_link_left">
            <ShieldCheck size={19} strokeWidth={2} />
            <span>Privacy Policy</span>
          </span>

          <span className="about_link_arrow">›</span>
        </button>

        <button
          className="about_link"
          onClick={() => navigate('/terms-conditions')}
        >
          <span className="about_link_left">
            <FileText size={19} strokeWidth={2} />
            <span>Terms & Conditions</span>
          </span>

          <span className="about_link_arrow">›</span>
        </button>
      </section>
    </main>
  );
}

export default About;
