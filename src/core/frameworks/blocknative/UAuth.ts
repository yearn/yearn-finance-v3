import { WalletModule } from 'bnc-onboard/dist/src/interfaces';
import UAuthBncOnboard from '@uauth/bnc-onboard';

const uauthOnboard = new UAuthBncOnboard({
  clientID: process.env.REACT_APP_CLIENT_ID!,
  redirectUri: process.env.REACT_APP_REDIRECT_URI!,
  postLogoutRedirectUri: process.env.REACT_APP_POST_LOGOUT_REDIRECT_URI!,
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
    infuraId: process.env.REACT_APP_INFURA_ID!,
  },
});

export default uauthWallet;
