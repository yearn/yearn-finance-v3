import { getConfig } from '@config';

export const isProd = () => getConfig().ENV === 'production';

export const isDev = () => getConfig().ENV === 'development';

export const enableDevTools = () => isDev() || getConfig().ALLOW_DEV_MODE;

export const isVeYfiEnv = () => window.location.hostname.split('.')[0] === 'vote' || getConfig().USE_VEYFI_ROUTES;
