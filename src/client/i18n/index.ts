import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

import { isDev } from '@utils';
import { getConfig } from '@config';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    supportedLngs: getConfig().SUPPORTED_LANGS,
    nonExplicitSupportedLngs: true,
    fallbackLng: getConfig().DEFAULT_LANG,
    preload: [getConfig().DEFAULT_LANG],
    load: 'languageOnly',
    defaultNS: 'common',
    ns: ['common', 'home', 'labs', 'modals', 'settings', 'vaultdetails', 'vaults', 'wallet'],
    lowerCaseLng: true,
    debug: isDev(),
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
