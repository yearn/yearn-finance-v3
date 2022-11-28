import { createAction, createAsyncThunk } from '@reduxjs/toolkit';

import { ThunkAPI } from '@frameworks/redux';
import { getNetwork, isNativeToken, validateNetwork } from '@utils';
import { TokenDynamicData, Token, Balance, Integer } from '@types';

/* -------------------------------------------------------------------------- */
/*                                   Setters                                  */
/* -------------------------------------------------------------------------- */

const setSelectedTokenAddress = createAction<{ tokenAddress?: string }>('tokens/setSelectedTokenAddress');
const setTokenAllowance = createAction<{ tokenAddress: string; spenderAddress: string; allowance: Integer }>(
  'tokens/setTokenAllowance'
);

/* -------------------------------------------------------------------------- */
/*                                 Clear State                                */
/* -------------------------------------------------------------------------- */

const clearTokensData = createAction<void>('tokens/clearTokensData');
const clearUserTokenState = createAction<void>('tokens/clearUserTokenState');

/* -------------------------------------------------------------------------- */
/*                                 Fetch Data                                 */
/* -------------------------------------------------------------------------- */

const getTokens = createAsyncThunk<{ tokensData: Token[] }, string | undefined, ThunkAPI>(
  'tokens/getTokens',
  async (_arg, { getState, extra }) => {
    const { network } = getState();
    const { tokenService } = extra.services;
    const { NETWORK, USE_VEYFI_ROUTES } = extra.config;
    const defaultNetwork = USE_VEYFI_ROUTES ? NETWORK : network.current;
    const tokensData: Token[] = await tokenService.getSupportedTokens({
      network: defaultNetwork,
    });
    return { tokensData };
  }
);

const getTokensDynamicData = createAsyncThunk<
  { tokensDynamicData: TokenDynamicData[] },
  { addresses: string[] },
  ThunkAPI
>('tokens/getTokensDynamic', async ({ addresses }, { getState, extra }) => {
  const { network } = getState();
  const { tokenService } = extra.services;
  const { NETWORK, USE_VEYFI_ROUTES } = extra.config;
  const defaultNetwork = USE_VEYFI_ROUTES ? NETWORK : network.current;
  const tokensDynamicData = await tokenService.getTokensDynamicData({ network: defaultNetwork, addresses });
  return { tokensDynamicData };
});

const getUserTokens = createAsyncThunk<{ userTokens: Balance[] }, { addresses?: string[] }, ThunkAPI>(
  'tokens/getUserTokens',
  async ({ addresses }, { extra, getState }) => {
    const { network, wallet } = getState();
    const { NETWORK, USE_VEYFI_ROUTES } = extra.config;
    const defaultNetwork = USE_VEYFI_ROUTES ? NETWORK : network.current;

    const accountAddress = wallet.selectedAddress;
    if (!accountAddress) throw new Error('WALLET NOT CONNECTED');

    const { tokenService } = extra.services;
    const userTokens = await tokenService.getUserTokensData({
      network: defaultNetwork,
      accountAddress,
      tokenAddresses: addresses,
    });
    return { userTokens };
  }
);

const getTokenAllowance = createAsyncThunk<
  { allowance: Integer },
  { tokenAddress: string; spenderAddress: string },
  ThunkAPI
>('tokens/getTokenAllowance', async ({ tokenAddress, spenderAddress }, { extra, getState }) => {
  const { network, wallet } = getState();
  const { NETWORK, USE_VEYFI_ROUTES } = extra.config;
  const defaultNetwork = USE_VEYFI_ROUTES ? NETWORK : network.current;

  const accountAddress = wallet.selectedAddress;
  if (!accountAddress) throw new Error('WALLET NOT CONNECTED');

  if (isNativeToken(tokenAddress)) return { allowance: extra.config.MAX_UINT256 };

  const { tokenService } = extra.services;
  const allowance = await tokenService.getTokenAllowance({
    network: defaultNetwork,
    accountAddress,
    tokenAddress,
    spenderAddress,
  });

  return { allowance };
});

/* -------------------------------------------------------------------------- */
/*                             Transaction Methods                            */
/* -------------------------------------------------------------------------- */

const approve = createAsyncThunk<
  { amount: string },
  { tokenAddress: string; spenderAddress: string; amountToApprove?: string },
  ThunkAPI
>('tokens/approve', async ({ tokenAddress, spenderAddress, amountToApprove }, { extra, getState }) => {
  const { network, wallet, app } = getState();
  const { tokenService, transactionService } = extra.services;
  const { NETWORK, USE_VEYFI_ROUTES } = extra.config;
  const defaultNetwork = USE_VEYFI_ROUTES ? NETWORK : network.current;
  const amount = amountToApprove ?? extra.config.MAX_UINT256;

  const accountAddress = wallet.selectedAddress;
  if (!accountAddress) throw new Error('WALLET NOT CONNECTED');

  const { error: networkError } = validateNetwork({
    currentNetwork: defaultNetwork,
    walletNetwork: wallet.networkVersion ? getNetwork(wallet.networkVersion) : undefined,
  });
  if (networkError) throw new Error(networkError);

  const tx = await tokenService.approve({
    network: network.current,
    accountAddress,
    tokenAddress,
    spenderAddress,
    amount,
  });
  const notificationsEnabled = app.servicesEnabled.notifications;
  await transactionService.handleTransaction({
    tx,
    network: network.current,
    useExternalService: notificationsEnabled,
  });

  return { amount };
});

/* -------------------------------------------------------------------------- */
/*                                Subscriptions                               */
/* -------------------------------------------------------------------------- */

const initSubscriptions = createAsyncThunk<void, void, ThunkAPI>(
  'tokens/initSubscriptions',
  async (_arg, { extra, dispatch }) => {
    const { subscriptionService } = extra.services;
    subscriptionService.subscribe({
      module: 'tokens',
      event: 'priceUsdc',
      action: (tokenAddresses: string[]) => {
        dispatch(getTokensDynamicData({ addresses: tokenAddresses }));
      },
    });
    subscriptionService.subscribe({
      module: 'tokens',
      event: 'balances',
      action: (tokenAddresses: string[]) => {
        dispatch(getUserTokens({ addresses: tokenAddresses }));
      },
    });
    subscriptionService.subscribe({
      module: 'tokens',
      event: 'getAllowance',
      action: (tokenAddress: string, spenderAddress: string) => {
        dispatch(getTokenAllowance({ tokenAddress, spenderAddress }));
      },
    });
  }
);

/* -------------------------------------------------------------------------- */
/*                                   Exports                                  */
/* -------------------------------------------------------------------------- */

export const TokensActions = {
  setSelectedTokenAddress,
  setTokenAllowance,
  getTokens,
  getTokensDynamicData,
  getUserTokens,
  getTokenAllowance,
  approve,
  initSubscriptions,
  clearTokensData,
  clearUserTokenState,
};
