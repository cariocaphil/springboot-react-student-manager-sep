import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { AppLanguageCode, DEFAULT_LANGUAGE } from './languages';
import de from './locales/de.json';
import en from './locales/en.json';

void i18n.use(initReactI18next).init({
  resources: {
    [AppLanguageCode.En]: { translation: en },
    [AppLanguageCode.De]: { translation: de },
  },
  lng: DEFAULT_LANGUAGE,
  fallbackLng: DEFAULT_LANGUAGE,
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
