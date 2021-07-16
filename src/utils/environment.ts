import { getConfig } from '@config';

export const isProd = () => getConfig().ENV === 'production';

export const isDev = () => getConfig().ENV === 'development';

export const enableDevTools = () => isDev() || getConfig().ALLOW_DEV_MODE;
