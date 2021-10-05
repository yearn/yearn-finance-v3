import Notify, { UpdateNotification } from 'bnc-notify';

import { getNetworkId } from '@utils';
import { getConfig } from '@config';

const { BLOCKNATIVE_KEY, NETWORK } = getConfig();

const notify = Notify({
  dappId: BLOCKNATIVE_KEY,
  networkId: getNetworkId(NETWORK),
});

export type { UpdateNotification };

export { notify };
