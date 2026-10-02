import { createContext, useContext, useState } from 'react';

import en from '../locales/en';
import kn from '../locales/kn';
import hi from '../locales/hi';

const translations = {
  en,
  kn,
  hi,
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem('rma_language');

    return translations[savedLanguage] ? savedLanguage : 'en';
  });

  const changeLanguage = (newLanguage) => {
    if (!translations[newLanguage]) {
      return;
    }

    setLanguage(newLanguage);
    localStorage.setItem('rma_language', newLanguage);
  };

  const value = {
    language,
    setLanguage: changeLanguage,
    t: translations[language],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
