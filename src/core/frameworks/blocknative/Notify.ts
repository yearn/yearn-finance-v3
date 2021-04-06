import Notify from 'bnc-notify';

import { getNetworkId } from '@utils';
import { getConfig } from '@config';

const { BLOCKNATIVE_KEY, ETHEREUM_NETWORK } = getConfig();

const notify = Notify({
  dappId: BLOCKNATIVE_KEY,
  networkId: getNetworkId(ETHEREUM_NETWORK),
});

export { notify };
