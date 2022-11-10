import { BigNumber, utils } from 'ethers';
import { BytesLike } from '@ethersproject/bytes/src.ts';
import { createAction, createAsyncThunk } from '@reduxjs/toolkit';

import { ThunkAPI } from '@frameworks/redux';
import {
  AggregatedCreditLine,
  CreditLinePage,
  TransactionOutcome,
  Address,
  Wei,
  TokenAllowance,
  GetLineArgs,
  GetLinesArgs,
  GetLinePageArgs,
  PositionSummary,
  AddCreditProps,
  UseCreditLinesParams,
  BorrowCreditProps,
  Network,
  DeploySecuredLineProps,
} from '@types';
import {
  toBN,
  formatGetLinesData,
  formatLinePageData,
  // validateLineDeposit,
  // validateLineWithdraw,
  // validateMigrateLineAllowance,
  // parseError,
} from '@utils';
import { unnullify } from '@utils';

import { TokensActions } from '../tokens/tokens.actions';

/* -------------------------------------------------------------------------- */
/*                                   Setters                                  */
/* -------------------------------------------------------------------------- */

const setSelectedLineAddress = createAction<{ lineAddress?: string }>('lines/setSelectedLineAddress');
const setSelectedLinePosition = createAction<{ position?: string }>('lines/setSelectedLinePosition');

/* -------------------------------------------------------------------------- */
/*                                 Clear State                                */
/* -------------------------------------------------------------------------- */

const clearLinesData = createAction<void>('lines/clearLinesData');
const clearUserData = createAction<void>('lines/clearUserData');
const clearTransactionData = createAction<void>('lines/clearTransactionData');
const clearSelectedLineAndStatus = createAction<void>('lines/clearSelectedLineAndStatus');
const clearLineStatus = createAction<{ lineAddress: string }>('lines/clearLineStatus');

/* -------------------------------------------------------------------------- */
/*                                 Fetch Data                                 */
/* -------------------------------------------------------------------------- */

// const initiateSaveLines = createAsyncThunk<void, string | undefined, ThunkAPI>(
//   'lines/initiateSaveLines',
//   async (_arg, { dispatch }) => {
//     await dispatch(getLines([]));
//   }
// );

const getLine = createAsyncThunk<{ lineData: AggregatedCreditLine | undefined }, GetLineArgs, ThunkAPI>(
  'lines/getLine',
  async (params, { getState, extra }) => {
    const { network } = getState();
    const { creditLineService } = extra.services;
    const lineData = await creditLineService.getLine({ network: network.current, ...params });
    return { lineData };
  }
);

const getLines = createAsyncThunk<
  { linesData: { [category: string]: AggregatedCreditLine[] } },
  UseCreditLinesParams,
  ThunkAPI
>('lines/getLines', async (categories, { getState, extra }) => {
  const {
    network,
    tokens: { tokensMap },
  } = getState();

  const { creditLineService } = extra.services;

  const tokenPrices = Object.entries(tokensMap).reduce(
    (prices, [addy, { priceUsdc }]) => ({ ...prices, [addy]: priceUsdc }),
    {}
  );

  // ensure consistent ordering of categories
  const categoryKeys = Object.keys(categories);
  //@ts-ignore
  const promises = await Promise.all(
    categoryKeys
      .map((k) => categories[k])
      .map((params: GetLinesArgs) => creditLineService.getLines({ network: network.current, ...params }))
  );
  //@ts-ignore
  const linesData = categoryKeys.reduce(
    (all, category, i) =>
      // @dev assumes `promises` is same order as `categories`
      !promises[i] ? all : { ...all, [category]: formatGetLinesData(promises[i]!, tokenPrices) },
    {}
  );

  return { linesData };
});

const getLinePage = createAsyncThunk<{ linePageData: CreditLinePage | undefined }, GetLinePageArgs, ThunkAPI>(
  'lines/getLinePage',
  async ({ id }, { getState, extra }) => {
    const {
      network,
      lines: { linesMap, pagesMap },
      tokens: { tokensMap },
    } = getState();
    const { creditLineService } = extra.services;

    const tokenPrices = Object.entries(tokensMap).reduce(
      (prices, [addy, { priceUsdc }]) => ({ ...prices, [addy]: priceUsdc }),
      {}
    );

    const pageData = pagesMap[id];
    if (pageData) {
      return { linePageData: pageData };
    }

    const basicData = linesMap[id];

    // navigated directly to line page, need to fetch basic data
    const linePageResponse = await creditLineService.getLinePage({
      network: network.current,
      id,
    });
    const linePageData = linePageResponse ? formatLinePageData(linePageResponse, tokenPrices) : undefined;
    return { linePageData };
  }
);

const getUserLinePositions = createAsyncThunk<
  { userLinesPositions: PositionSummary[] },
  { lineAddresses?: string[] },
  ThunkAPI
>('lines/getUserLinePositions', async ({ lineAddresses }, { extra, getState }) => {
  const { network, wallet } = getState();
  const { services } = extra;
  const userAddress = wallet.selectedAddress;
  if (!userAddress) {
    throw new Error('WALLET NOT CONNECTED');
  }
  const userLinesPositions = await services.creditLineService.getUserLinePositions({
    network: network.current,
    userAddress,
  });
  return { userLinesPositions };
});

export interface GetExpectedTransactionOutcomeProps {
  transactionType: 'DEPOSIT' | 'WITHDRAW';
  sourceTokenAddress: Address;
  sourceTokenAmount: Wei;
  targetTokenAddress: Address;
}

const getExpectedTransactionOutcome = createAsyncThunk<
  { txOutcome: TransactionOutcome },
  GetExpectedTransactionOutcomeProps,
  ThunkAPI
>(
  'lines/getExpectedTransactionOutcome',
  async (getExpectedTxOutcomeProps, { getState, extra }) => {
    const { network, app } = getState();
    const { services } = extra;
    const { creditLineService } = services;
    const { transactionType, sourceTokenAddress, sourceTokenAmount, targetTokenAddress } = getExpectedTxOutcomeProps;

    const accountAddress = getState().wallet.selectedAddress;
    if (!accountAddress) throw new Error('WALLET NOT CONNECTED');

    const simulationsEnabled = app.servicesEnabled.tenderly;
    if (!simulationsEnabled) throw new Error('SIMULATIONS DISABLED');

    const txOutcome = await creditLineService.getExpectedTransactionOutcome({
      network: network.current,
      transactionType,
      accountAddress,
      sourceTokenAddress,
      sourceTokenAmount,
      targetTokenAddress,
    });

    return { txOutcome };
  },
  {
    // serializeError: parseError,
  }
);

/* -------------------------------------------------------------------------- */
/*                             Transaction Methods                            */
/* -------------------------------------------------------------------------- */

const deploySecuredLine = createAsyncThunk<void, DeploySecuredLineProps, ThunkAPI>(
  'lines/deploySecredLine',
  async (deployData, { getState, extra }) => {
    const { lineFactoryService } = extra.services;
    const deployedLineData = await lineFactoryService.deploySecuredLine({
      ...deployData,
    });

    console.log('new secured line deployed. tx response', deployedLineData);
    // await dispatch(getLine(deployedLineData.))
  }
);

const approveDeposit = createAsyncThunk<
  void,
  {
    tokenAddress: string;
    amount: string;
    lineAddress: string;
    network: Network;
  },
  ThunkAPI
  //@ts-ignore
>('lines/approveDeposit', async ({ amount, spenderAddress, tokenAddress, network }, { getState, dispatch, extra }) => {
  const { wallet } = getState();
  const { tokenService } = extra.services;

  const accountAddress = wallet.selectedAddress;
  if (!accountAddress) throw new Error('WALLET NOT CONNECTED');

  const approveDepositTx = await tokenService.approve({
    network,
    tokenAddress,
    accountAddress,
    spenderAddress: spenderAddress,
    amount: unnullify(amount, true),
  });
  console.log('this is approval', approveDepositTx);
});

const borrowCredit = createAsyncThunk<void, BorrowCreditProps, ThunkAPI>(
  'lines/borrowCredit',
  async ({ positionId, amount, network, line }, { extra, getState }) => {
    const { wallet } = getState();
    const { services } = extra;
    console.log('look at borrow credit', wallet, positionId, amount, line);
    const { creditLineService } = services;

    const tx = await creditLineService.borrow({
      line: line,
      positionId: positionId,
      amount: amount,
      network: network,
      dryRun: false,
    });
    console.log(tx);
  }
);

const addCredit = createAsyncThunk<void, AddCreditProps, ThunkAPI>(
  'lines/addCredit',
  async ({ lineAddress, drate, frate, amount, token, lender, network }, { extra, getState, dispatch }) => {
    const { wallet } = getState();
    const { services } = extra;
    const userAddress = wallet.selectedAddress;
    if (!userAddress) throw new Error('WALLET NOT CONNECTED');

    // TODO: fix BigNumber type difference issues
    // const amountInWei = amount.multipliedBy(ONE_UNIT);
    const { creditLineService } = services;
    const tx = await creditLineService.addCredit({
      lineAddress: lineAddress,
      drate: drate,
      frate: frate,
      amount: amount,
      token: token,
      lender: lender,
      dryRun: true,
      network: network,
    });
    console.log(tx);
    // const notifyEnabled = app.servicesEnabled.notify;
    // await transactionService.handleTransaction({ tx, network: network.current, useExternalService: notifyEnabled });
  }
);

const depositAndRepay = createAsyncThunk<
  void,
  {
    lineAddress: string;
    tokenAddress: string;
    amount: BigNumber;
    network: Network;
    slippageTolerance?: number;
  },
  ThunkAPI
>(
  'lines/depositAndRepay',

  async ({ lineAddress, tokenAddress, amount, network }, { extra, getState, dispatch }) => {
    const { wallet, lines, tokens } = getState();
    const { services } = extra;

    const userAddress = wallet.selectedAddress;
    if (!userAddress) throw new Error('WALLET NOT CONNECTED');

    const userLineData = lines.user.linePositions[lineAddress];
    const tokenData = tokens.tokensMap[tokenAddress];
    const userTokenData = tokens.user.userTokensMap[tokenAddress];
    const decimals = toBN(tokenData.decimals);
    const ONE_UNIT = toBN('10').pow(decimals);

    const { creditLineService, interestRateCreditService } = services;
    // const { error: depositError } = validateLineDeposit({
    //   sellTokenAmount: amount,
    //   depositLimit: lineData?.metadata.depositLimit ?? '0',
    //   emergencyShutdown: lineData?.metadata.emergencyShutdown || false,
    //   sellTokenDecimals: tokenData?.decimals ?? '0',
    //   userTokenBalance: userTokenData?.balance ?? '0',
    //   lineUnderlyingBalance: lineData?.underlyingTokenBalance.amount ?? '0',
    //   targetUnderlyingTokenAmount,
    // });

    // const error = depositError;
    // if (error) throw new Error(error);

    // TODO: fix BigNumber type difference issues
    // const amountInWei = amount.multipliedBy(ONE_UNIT);
    // const { creditLineService, transactionService } = services;
    const tx = await creditLineService.depositAndRepay(
      {
        lineAddress: lineAddress,
        amount: amount,
        network: network,
      },
      interestRateCreditService
    );
    console.log(tx);
    // const notifyEnabled = app.servicesEnabled.notify;
    // await transactionService.handleTransaction({ tx, network: network.current, useExternalService: notifyEnabled });
    dispatch(getLinePage({ id: lineAddress }));
    // dispatch(getUserLinesSummary());
    dispatch(getUserLinePositions({ lineAddresses: [lineAddress] }));
    // dispatch(getUserLinesMetadata({ linesAddresses: [lineAddress] }));
    dispatch(TokensActions.getUserTokens({ addresses: [tokenAddress, lineAddress] }));
  },
  {
    // serializeError: parseError,
  }
);

const claimAndRepay = createAsyncThunk<
  void,
  {
    lineAddress: Address;
    claimToken: Address;
    calldata: BytesLike;
    network: Network;
  },
  ThunkAPI
>(
  'lines/claimAndRepay',

  async ({ lineAddress, claimToken, calldata }, { extra, getState, dispatch }) => {
    const { wallet, network } = getState();
    const { services } = extra;

    const userAddress = wallet.selectedAddress;
    if (!userAddress) throw new Error('Wallet not connected');

    const { collateralService } = services;

    const tx = await collateralService.claimAndRepay({
      lineAddress,
      claimToken,
      zeroExTradeData: calldata,
      network: network.current,
      dryRun: false,
    });
    console.log(tx);
  }
);

const depositAndClose = createAsyncThunk<
  void,
  {
    lineAddress: Address;
    network: Network;
    id: string;
  },
  ThunkAPI
>(
  'lines/depositAndClose',

  async ({ lineAddress, network, id }, { extra, getState, dispatch }) => {
    const { wallet } = getState();
    const { services } = extra;

    const userAddress = wallet.selectedAddress;
    if (!userAddress) throw new Error('Wallet not connected');

    const { creditLineService } = services;

    const tx = await creditLineService.depositAndClose({
      lineAddress: lineAddress,
      id: id,
      network: network,
    });
    console.log(tx);
  }
);

const liquidate = createAsyncThunk<
  void,
  {
    lineAddress: string;
    amount: BigNumber;
    tokenAddress: string;
  },
  ThunkAPI
>(
  'lines/liquidate',
  async ({ lineAddress, tokenAddress, amount }, { extra, getState, dispatch }) => {
    const { wallet, network } = getState();
    const { services } = extra;

    const userAddress = wallet.selectedAddress;
    if (!userAddress) throw new Error('WALLET NOT CONNECTED');

    const { collateralService } = services;
    // TODO get user collateral metadata
    // TODO assert metadata role === arbiter

    // const { error: depositError } = validateLineDeposit({
    //   sellTokenAmount: amount,
    //   depositLimit: lineData?.metadata.depositLimit ?? '0',
    //   emergencyShutdown: lineData?.metadata.emergencyShutdown || false,
    //   sellTokenDecimals: tokenData?.decimals ?? '0',
    //   userTokenBalance: userTokenData?.balance ?? '0',
    //   lineUnderlyingBalance: lineData?.underlyingTokenBalance.amount ?? '0',
    //   targetUnderlyingTokenAmount,
    // });

    // const error = depositError;
    // if (error) throw new Error(error);

    const tx = await collateralService.liquidate({
      // userPositionMetadata: ,
      lineAddress: lineAddress,
      amount: amount,
      token: tokenAddress,
      to: userAddress,
      network: network.current,
      dryRun: false,
    });
    console.log(tx);

    // const notifyEnabled = app.servicesEnabled.notify;
    // await transactionService.handleTransaction({ tx, network: network.current, useExternalService: notifyEnabled });
    // dispatch(getLinePage({ id: lineAddress }));
    // // dispatch(getUserLinesSummary());
    // dispatch(getUserLinePositions({ lineAddresses: [lineAddress] }));
    // // dispatch(getUserLinesMetadata({ linesAddresses: [lineAddress] }));
    // dispatch(TokensActions.getUserTokens({ addresses: [tokenAddress, lineAddress] }));
  },
  {
    // serializeError: parseError,
  }
);

const withdrawLine = createAsyncThunk<
  void,
  {
    lineAddress: string;
    amount: BigNumber;
    network: Network;
  },
  ThunkAPI
>(
  'lines/withdrawLine',
  async ({ lineAddress, amount, network }, { extra, getState, dispatch }) => {
    const { wallet, lines } = getState();
    const { services, config } = extra;

    const userAddress = wallet.selectedAddress;
    if (!userAddress) throw new Error('WALLET NOT CONNECTED');

    //const { error: networkError } = validateNetwork({
    //  currentNetwork: network.current,
    //  walletNetwork: wallet.networkVersion ? getNetwork(wallet.networkVersion) : undefined,
    //});
    //if (networkError) throw networkError;

    const lineData = lines.linesMap[lineAddress];
    const userLineData = lines.user.linePositions[lineAddress];
    // selector for UserPositionMetadata to get available liquidity
    const available = utils.parseUnits(userLineData.deposit, 'wei').sub(userLineData.principal);
    // if requesting more than available or max available
    const withdrawAll = amount.eq(config.MAX_UINT256) || amount.gte(available);
    const amountOfShares = withdrawAll ? available : amount;

    // const { error: withdrawError } = validateLineWithdraw({
    //   amount: toBN(normalizeAmount(amountOfShares, parseInt(tokenData.decimals))),
    //   line: userLineData.balance ?? '0',
    //   token: tokenData.decimals.toString() ?? '0', // check if its ok to use underlyingToken decimals as line decimals
    // });

    // const error = withdrawError;
    // if (error) throw new Error(error);
    // TODO: fix BigNumber type difference issues
    const { creditLineService } = services;
    const tx = await creditLineService.withdraw({
      id: lineAddress,
      amount: amountOfShares,
      lineAddress: lineAddress,
      network: network,
      dryRun: true,
    });
    console.log(tx);
    // const notifyEnabled = app.servicesEnabled.notify;
    // await transactionService.handleTransaction({ tx, network: network.current, useExternalService: notifyEnabled });
    dispatch(getLinePage({ id: lineAddress }));
    // dispatch(getUserLinesSummary());
    dispatch(getUserLinePositions({ lineAddresses: [lineAddress] }));
    // dispatch(getUserLinesMetadata({ linesAddresses: [lineAddress] }));
    //dispatch(TokensActions.getUserTokens({ addresses: [targetTokenAddress, lineAddress] }));
  },
  {
    // serializeError: parseError,
  }
);

const getDepositAllowance = createAsyncThunk<
  TokenAllowance,
  {
    tokenAddress: string;
    lineAddress: string;
  },
  ThunkAPI
>('lines/getDepositAllowance', async ({ lineAddress, tokenAddress }, { extra, getState, dispatch }) => {
  const {
    services: { creditLineService },
  } = extra;
  const { network, wallet } = getState();
  const accountAddress = wallet.selectedAddress;

  if (!accountAddress) throw new Error('WALLET NOT CONNECTED');

  const tokenAllowance = await creditLineService.getDepositAllowance({
    network: network.current,
    lineAddress,
    tokenAddress,
    accountAddress,
  });

  await dispatch(
    TokensActions.setTokenAllowance({
      tokenAddress,
      spenderAddress: tokenAllowance.spender,
      allowance: tokenAllowance.amount,
    })
  );

  return tokenAllowance;
});

const getWithdrawAllowance = createAsyncThunk<
  TokenAllowance,
  {
    id: string;
    lineAddress: string;
  },
  ThunkAPI
>('lines/getWithdrawAllowance', async ({ lineAddress, id }, { extra, getState, dispatch }) => {
  const {
    services: { creditLineService },
  } = extra;
  const { network, wallet } = getState();
  const accountAddress = wallet.selectedAddress;

  if (!accountAddress) throw new Error('WALLET NOT CONNECTED');

  const tokenAllowance = await creditLineService.getWithdrawAllowance({
    network: network.current,
    lineAddress,
    id,
    accountAddress,
  });

  await dispatch(
    TokensActions.setTokenAllowance({
      tokenAddress: tokenAllowance.token,
      spenderAddress: tokenAllowance.spender,
      allowance: tokenAllowance.amount,
    })
  );

  return tokenAllowance;
});

/////
// øld yearn<>zapper code. Keep for future zaps re-integration
/////

// const approveZapOut = createAsyncThunk<void, { lineAddress: string; tokenAddress: string }, ThunkAPI>(
//   'lines/approveZapOut',
//   async ({ lineAddress, tokenAddress }, { getState, dispatch, extra }) => {
//     const { wallet, network } = getState();
//     const { creditLineService, transactionService } = extra.services;
//     const amount = extra.config.MAX_UINT256;

//     const accountAddress = wallet.selectedAddress;
//     if (!accountAddress) throw new Error('WALLET NOT CONNECTED');

//     const tx = await creditLineService.approveZapOut({
//       network: network.current,
//       accountAddress,
//       amount,
//       lineAddress,
//       tokenAddress,
//     });

//     await transactionService.handleTransaction({ tx, network: network.current });

//     await dispatch(getWithdrawAllowance({ tokenAddress, lineAddress }));
//   },
//   {
//     // serializeError: parseError,
//   }
// );

// const signZapOut = createAsyncThunk<{ signature: string }, { lineAddress: string }, ThunkAPI>(
//   'lines/signZapOut',
//   async ({ lineAddress }, { getState, extra }) => {
//     const { network, wallet } = getState();
//     const { creditLineService } = extra.services;
//     const { CONTRACT_ADDRESSES } = extra.config;

//     // NOTE: this values are hardcoded on zappers zapOut contract
//     const amount = '79228162514260000000000000000'; // https://etherscan.io/address/0xd6b88257e91e4E4D4E990B3A858c849EF2DFdE8c#code#F8#L83
//     const deadline = '0xf000000000000000000000000000000000000000000000000000000000000000'; // https://etherscan.io/address/0xd6b88257e91e4E4D4E990B3A858c849EF2DFdE8c#code#F8#L80

//     const accountAddress = wallet.selectedAddress;
//     if (!accountAddress) throw new Error('WALLET NOT CONNECTED');

//     const signature = await creditLineService.signPermit({
//       network: network.current,
//       accountAddress,
//       lineAddress,
//       spenderAddress: CONTRACT_ADDRESSES.zapOut,
//       amount,
//       deadline,
//     });

//     return { signature };
//   },
//   {
//     // serializeError: parseError,
//   }
// );

/* -------------------------------------------------------------------------- */
/*                                Subscriptions                               */
/* -------------------------------------------------------------------------- */

// const initSubscriptions = createAsyncThunk<void, void, ThunkAPI>(
//   'lines/initSubscriptions',
//   async (_arg, { extra, dispatch }) => {
//     const { subscriptionService } = extra.services;
//     subscriptionService.subscribe({
//       module: 'lines',
//       event: 'getDynamic',
//       action: (linesAddresses: string[]) => {
//         dispatch(getLinePage({ addresses: linesAddresses }));
//       },
//     });
//     subscriptionService.subscribe({
//       module: 'lines',
//       event: 'positionsOf',
//       action: (lineAddresses: string[]) => {
//         dispatch(getUserLinesSummary());
//         dispatch(getUserLinePositions({ lineAddresses }));
//         dispatch(getUserLinesMetadata({ linesAddresses: lineAddresses }));
//       },
//     });
//   }
// );

/* -------------------------------------------------------------------------- */
/*                                   Exports                                  */
/* -------------------------------------------------------------------------- */

export const LinesActions = {
  setSelectedLineAddress,
  setSelectedLinePosition,
  // initiateSaveLines,
  getLine,
  getLines,
  getLinePage,
  getUserLinePositions,
  approveDeposit,
  addCredit,
  depositAndRepay,
  depositAndClose,
  borrowCredit,
  deploySecuredLine,
  // approveZapOut,
  // signZapOut,
  withdrawLine,
  liquidate,
  // migrateLine,
  // initSubscriptions,
  clearLinesData,
  clearUserData,
  getExpectedTransactionOutcome,
  claimAndRepay,
  clearTransactionData,
  // getUserLinesSummary,
  // getUserLinesMetadata,
  clearSelectedLineAndStatus,
  clearLineStatus,
  getDepositAllowance,
  getWithdrawAllowance,
};
