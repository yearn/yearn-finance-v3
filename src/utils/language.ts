import i18n from 'i18next';

import { Language } from '@types';
import { getConfig } from '@config';

export const getCurrentLanguage = (): Language => {
  return (i18n.languages[0] as Language) ?? getConfig().DEFAULT_LANG;
};
