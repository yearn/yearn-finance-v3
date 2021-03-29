import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

import { isDev } from '@utils';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    supportedLngs: ['en', 'es'],
    fallbackLng: 'en',
    preload: ['en'],
    defaultNS: 'common',
    lowerCaseLng: true,
    debug: isDev(),
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
