import './Language.css';

import { useLanguage } from '../../../context/LanguageContext';
import { useNavigate } from 'react-router-dom';

function Language() {
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();

  const languages = [
    {
      code: 'en',
      name: 'English',
      nativeName: 'English',
    },
    {
      code: 'kn',
      name: 'Kannada',
      nativeName: 'ಕನ್ನಡ',
    },
    {
      code: 'hi',
      name: 'Hindi',
      nativeName: 'हिन्दी',
    },
    {
      code: 'mr',
      name: 'Marathi',
      nativeName: 'मराठी',
    },
  ];

  const handleLanguageChange = (code) => {
    setLanguage(code);
  };

  return (
    <main className="language_page">
      <div className="language_header">
        <button className="language_back" onClick={() => navigate('/profile')}>
          ‹
        </button>

        <h1>Language</h1>
      </div>

      <section className="language_card">
        <div className="language_card_header">
          <h2>Choose your language</h2>

          <p>Select the language you'd like to use in RMA.</p>
        </div>

        <div className="language_list">
          {languages.map((item) => {
            const selected = language === item.code;

            return (
              <button
                key={item.code}
                className={
                  selected ? 'language_item selected' : 'language_item'
                }
                onClick={() => handleLanguageChange(item.code)}
              >
                <div className="language_item_text">
                  <strong>{item.name}</strong>

                  <span>{item.nativeName}</span>
                </div>

                <div
                  className={
                    selected ? 'language_radio checked' : 'language_radio'
                  }
                >
                  {selected && '✓'}
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </main>
  );
}

export default Language;
