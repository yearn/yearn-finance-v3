import { getConfig } from '@config';

export const isProd = () => getConfig().ENV === 'production';

export const isDev = () => getConfig().ENV === 'development';

console.log({ ZAPPER_API: getConfig().ZAPPER_API_KEY });

export const enableDevTools = () => isDev() || getConfig().ALLOW_DEV_MODE;
