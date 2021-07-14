import { getConfig } from '@config';

export const isProd = () => getConfig().ENV === 'production';

export const isDev = () => {
  console.log({ ENV: getConfig().ENV });

  return getConfig().ENV === 'development';
};
