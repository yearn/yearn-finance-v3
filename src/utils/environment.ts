import { getConfig } from '@config';

export const isProd = () => getConfig().ENV === 'production';

export const isDev = () => getConfig().ENV === 'development';
