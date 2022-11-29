import { WalletModule } from 'bnc-onboard/dist/src/interfaces';
import UAuthBncOnboard from '@uauth/bnc-onboard';

import { getConfig } from '@config';

const { UNSTOPPABLE_DOMAINS_ID, INFURA_PROJECT_ID, HOST } = getConfig();

const uauthOnboard = new UAuthBncOnboard({
  clientID: UNSTOPPABLE_DOMAINS_ID,
  redirectUri: HOST,
  postLogoutRedirectUri: HOST,
  scope: 'openid wallet',
});

const uauthWallet: WalletModule = uauthOnboard.module({
  // Mark true if you want Unstoppable to be
  preferred: false,
  // Onboard uses a store system that makes it impossible to read the
  // state of other wallets. This means that we have to supply a seperate
  // configuration to the @walletconnect/web3-provider instance.
  // See here: https://docs.walletconnect.com/1.0/quick-start/dapps/web3-provider
  walletconnect: {
    infuraId: INFURA_PROJECT_ID,
  },
});

export default uauthWallet;
