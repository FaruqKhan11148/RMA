import { createContext, useContext, useState } from 'react';

import en from '../locales/en';
import kn from '../locales/kn';
import hi from '../locales/hi';
import mr from '../locales/mr';

const translations = {
  en,
  kn,
  hi,
  mr,
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');

  const value = {
    language,
    setLanguage,
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
