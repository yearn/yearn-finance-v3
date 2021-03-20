import { memoize } from 'lodash';

import { Config } from '@types';
import { getConstants } from './constants';
import { getEnv } from './env';

export const getConfig = memoize(
  (): Config => ({
    ...getConstants(),
    ...getEnv(),
  })
);
