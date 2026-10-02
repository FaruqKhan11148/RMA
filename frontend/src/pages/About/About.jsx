import './About.css';

import { Info, ShieldCheck, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

function About() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <main className="about_page">
      <section className="about_header">
        <div className="about_logo">RMA</div>

        <h1>{t.about.title}</h1>

        <p className="about_tagline">{t.about.tagline}</p>

        <span className="about_version">{t.about.version}</span>
      </section>

      <section className="about_content">
        <div className="about_section">
          <div className="about_section_icon">
            <Info size={20} strokeWidth={2} />
          </div>

          <div>
            <h2>{t.about.aboutRma}</h2>

            <p>{t.about.aboutRmaDescription1}</p>

            <p>{t.about.aboutRmaDescription2}</p>
          </div>
        </div>

        <div className="about_section">
          <div className="about_section_icon">
            <Info size={20} strokeWidth={2} />
          </div>

          <div>
            <h2>{t.about.howRmaWorks}</h2>

            <p>{t.about.howRmaWorksDescription1}</p>

            <p>{t.about.howRmaWorksDescription2}</p>
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
            <span>{t.about.privacyPolicy}</span>
          </span>

          <span className="about_link_arrow">›</span>
        </button>

        <button
          className="about_link"
          onClick={() => navigate('/terms-conditions')}
        >
          <span className="about_link_left">
            <FileText size={19} strokeWidth={2} />
            <span>{t.about.termsConditions}</span>
          </span>

          <span className="about_link_arrow">›</span>
        </button>
      </section>
    </main>
  );
}

export default About;
