import { BigNumberish, BigNumber } from 'ethers';
import { Bytes, BytesLike } from '@ethersproject/bytes/src.ts';
import { PopulatedTransaction } from '@ethersproject/contracts/src.ts';

import {
  Vault,
  VaultDynamic,
  Token,
  TokenDynamicData,
  Position,
  TransactionResponse,
  Address,
  Integer,
  Wei,
  Balance,
  TransactionOutcome,
  TransactionReceipt,
  VaultsUserSummary,
  VaultUserMetadata,
  GasFees,
  Overrides,
  Network,
  TokenAllowance,
  Credit,
  CreditLine,
  CreditLinePage,
  PositionSummary,
  GetLineArgs,
  GetLinesArgs,
  GetLinePageArgs,
} from '@types';

// *************** USER ***************

export interface UserService {
  getAddressEnsName: (props: GetAddressEnsNameProps) => Promise<string>;
}

export interface GetAddressEnsNameProps {
  address: string;
}

// *************** VAULT ***************
export interface VaultService {
  getSupportedVaults: (props: GetSupportedVaultsProps) => Promise<Vault[]>;
  getVaultsDynamicData: (props: GetVaultsDynamicDataProps) => Promise<VaultDynamic[]>;
  getUserVaultsPositions: (props: GetUserVaultsPositionsProps) => Promise<Position[]>;
  getUserVaultsSummary: (props: GetUserVaultsSummaryProps) => Promise<VaultsUserSummary>;
  getUserVaultsMetadata: (props: GetUserVaultsMetadataProps) => Promise<VaultUserMetadata[]>;
  getExpectedTransactionOutcome: (props: GetExpectedTransactionOutcomeProps) => Promise<TransactionOutcome>;
  signPermit: (props: SignPermitProps) => Promise<string>;
  deposit: (props: DepositProps) => Promise<TransactionResponse>;
  withdraw: (props: WithdrawProps) => Promise<TransactionResponse>;
  approveDeposit: (props: ApproveDepositProps) => Promise<TransactionResponse>;
  approveZapOut: (props: ApproveZapOutProps) => Promise<TransactionResponse>;
  getDepositAllowance: (props: GetDepositAllowanceProps) => Promise<TokenAllowance>;
  getWithdrawAllowance: (props: GetWithdrawAllowanceProps) => Promise<TokenAllowance>;
}

export interface GetSupportedVaultsProps {
  network: Network;
  addresses?: Address[];
}

export interface GetVaultsDynamicDataProps {
  network: Network;
  addresses?: Address[];
}

export interface GetUserVaultsPositionsProps {
  network: Network;
  userAddress: Address;
  vaultAddresses?: string[];
}

export interface GetUserVaultsSummaryProps {
  network: Network;
  userAddress: Address;
}

export interface GetUserVaultsMetadataProps {
  network: Network;
  userAddress: Address;
  vaultsAddresses?: string[];
}

export interface GetExpectedTransactionOutcomeProps {
  network: Network;
  transactionType: 'DEPOSIT' | 'WITHDRAW';
  accountAddress: Address;
  sourceTokenAddress: Address;
  sourceTokenAmount: Wei;
  targetTokenAddress: Address;
  slippageTolerance?: number;
}

export interface SignPermitProps {
  network: Network;
  accountAddress: Address;
  vaultAddress: Address;
  spenderAddress: Address;
  amount: Wei;
  deadline: string;
}

export interface DepositProps {
  network: Network;
  accountAddress: Address;
  tokenAddress: Address;
  vaultAddress: Address;
  amount: Wei;
  slippageTolerance?: number;
}

export interface WithdrawProps {
  network: Network;
  accountAddress: Address;
  tokenAddress: Address;
  vaultAddress: Address;
  amountOfShares: Wei;
  slippageTolerance?: number;
  signature?: string;
}

export interface MigrateProps {
  network: Network;
  accountAddress: Address;
  vaultFromAddress: Address;
  vaultToAddress: Address;
  migrationContractAddress: Address;
}

// *************** LINE ***************
export enum STATUS {
  UNINITIALIZED,
  ACTIVE,
  LIQUIDATABLE,
  REPAID,
  INSOLVENT,
}

export interface InterestRateCreditService {
  accrueInterest: (props: InterestRateAccrueInterestProps) => Promise<BigNumber>;
}

export interface CreditLineService {
  // getters
  getLine: (props: GetLineProps) => Promise<CreditLine | undefined>;
  getLines: (props: GetLinesProps) => Promise<CreditLine[] | undefined>;
  getLinePage: (props: GetLinePageProps) => Promise<CreditLinePage | undefined>;
  getUserLinePositions: (...args: any) => Promise<any | undefined>;
  getExpectedTransactionOutcome: (...args: any) => Promise<any | undefined>;

  addCredit: (props: AddCreditProps) => Promise<TransactionResponse | PopulatedTransaction>;
  close: (props: CloseProps) => Promise<TransactionResponse>;
  withdraw: (props: WithdrawLineProps) => Promise<TransactionResponse>;
  setRates: (props: SetRatesProps) => Promise<TransactionResponse | PopulatedTransaction>;
  increaseCredit: (props: IncreaseCreditProps) => Promise<TransactionResponse | PopulatedTransaction>;
  depositAndRepay: (props: DepositAndRepayProps) => Promise<TransactionResponse | PopulatedTransaction>;
  depositAndClose: (props: DepositAndCloseProps) => Promise<TransactionResponse | PopulatedTransaction>;

  // helpers
  getFirstID: (contractAddress: string) => Promise<BytesLike>;
  getCredit: (contractAddress: string, id: BytesLike) => Promise<Credit>;
  getLenderByCreditID: (contractAddress: string, id: BytesLike) => Promise<Address>;
  borrower: (contractAddress: string) => Promise<Address>;
  isActive: (contractAddress: string) => Promise<boolean>;
  isBorrowing: (contractAddress: string) => Promise<boolean>;
  isBorrower: (contractAddress: string) => Promise<boolean>;
  isLender: (contractAddress: string, id: BytesLike) => Promise<boolean>;
  isMutualConsent: (
    contractAddress: string,
    trxData: string | undefined,
    signerOne: Address,
    signerTwo: Address
  ) => Promise<boolean>;
  isSignerBorrowerOrLender: (contractAddress: Address, id: BytesLike) => Promise<boolean>;

  // utils
  approveDeposit: (props: ApproveLineDepositProps) => Promise<any | undefined>;
  // approveZapOut: (...args: any) => Promise<any | undefined>;
  // signPermit: (...args: any) => Promise<any | undefined>;
  getDepositAllowance: (props: GetLineDepositAllowanceProps) => Promise<any | undefined>;
  getWithdrawAllowance: (props: GetLineWithdrawAllowanceProps) => Promise<any | undefined>;
}

export interface AddCreditProps {
  dryRun: boolean;
  lineAddress: string;
  token: Address;
  lender: Address;
  drate: BigNumberish;
  frate: BigNumberish;
  amount: BigNumber;
}

export interface CloseProps {
  dryRun: boolean;
  lineAddress: string;
  id: string;
}
export interface WithdrawLineProps {
  dryRun: boolean;
  lineAddress: string;
  id: string;
  amount: BigNumber;
}
export interface SetRatesProps {
  dryRun: boolean;
  lineAddress: string;
  id: string;
  frate: BigNumber;
  drate: BigNumber;
}
export interface IncreaseCreditProps {
  dryRun: boolean;
  lineAddress: string;
  id: string;
  amount: BigNumber;
}
export interface DepositAndRepayProps {
  dryRun: boolean;
  lineAddress: string;
  id: string;
  amount: BigNumber;
}
export interface DepositAndCloseProps {
  dryRun: boolean;
  lineAddress: string;
  id: string;
}

export interface ApproveLineDepositProps {
  network: Network;
  lineAddress: string;
  tokenAddress: string;
  accountAddress: string;
  amount: BigNumber;
}

export interface GetLineDepositAllowanceProps {
  network: Network;
  lineAddress: string;
  tokenAddress: string;
  accountAddress: string;
}

export interface GetLineWithdrawAllowanceProps {
  network: Network;
  lineAddress: string;
  accountAddress: string;
  id: string;
}

export interface InterestRateAccrueInterestProps {
  id: BytesLike;
  drawnBalance: BigNumberish;
  facilityBalance: BigNumberish;
}
export interface GetLineProps extends GetLineArgs {
  id: string;
  network: Network;
}

export interface GetLinesProps extends GetLinesArgs {
  network: Network;
}

export interface GetLinePageProps extends GetLinePageArgs {
  id: string;
  network: Network;
}

export interface SpigotedLineService {
  claimAndTrade(
    claimToken: Address,
    zeroExTradeData: BytesLike,
    dryRun: boolean
  ): Promise<TransactionResponse | PopulatedTransaction>;
  claimAndRepay(
    claimToken: Address,
    calldata: BytesLike,
    dryRun: boolean
  ): Promise<TransactionResponse | PopulatedTransaction>;
  addSpigot(
    revenueContract: Address,
    setting: ISpigotSetting,
    dryRun: boolean
  ): Promise<TransactionResponse | PopulatedTransaction>;
  isOwner(): Promise<boolean>;
  maxSplit(): Promise<BigNumber>;
  isBorrowing: () => Promise<boolean>;
  isBorrower: () => Promise<boolean>;
  borrower(): Promise<Address>;
  getFirstID(): Promise<BytesLike>;
  isSignerBorrowerOrLender(id: BytesLike): Promise<boolean>;
}

export interface ISpigotSetting {
  token: Address; // token to claim as revenue from contract
  ownerSplit: BigNumber; // x/100 % to Owner, rest to Treasury
  claimFunction: Bytes; // function signature on contract to call and claim revenue
  transferOwnerFunction: Bytes; // function signature on conract to call and transfer ownership
}

export interface EscrowService {
  addCollateral(
    amount: BigNumber,
    token: Address,
    dryRun: boolean
  ): Promise<TransactionResponse | PopulatedTransaction>;
  releaseCollateral(
    amount: BigNumber,
    token: Address,
    to: Address,
    dryRun: boolean
  ): Promise<TransactionResponse | PopulatedTransaction>;
  isBorrower(): Promise<boolean>;
}

// *************** TOKEN ***************
export interface TokenService {
  getSupportedTokens: (props: GetSupportedTokensProps) => Promise<Token[]>;
  getTokensDynamicData: (props: GetTokensDynamicDataProps) => Promise<TokenDynamicData[]>;
  getUserTokensData: (props: GetUserTokensDataProps) => Promise<Balance[]>;
  getTokenAllowance: (props: GetTokenAllowanceProps) => Promise<Integer>;
  approve: (props: ApproveProps) => Promise<TransactionResponse>;
}

export interface GetSupportedTokensProps {
  network: Network;
}

export interface GetTokensDynamicDataProps {
  network: Network;
  addresses: string[];
}

export interface GetUserTokensDataProps {
  network: Network;
  accountAddress: string;
  tokenAddresses?: string[];
}

export interface GetTokenAllowanceProps {
  network: Network;
  accountAddress: string;
  tokenAddress: string;
  spenderAddress: string;
}

export interface ApproveDepositProps {
  network: Network;
  accountAddress: Address;
  tokenAddress: Address;
  amount: Wei;
  vaultAddress: string;
}

export interface ApproveZapOutProps {
  network: Network;
  amount: Wei;
  accountAddress: string;
  tokenAddress: string;
  vaultAddress: string;
}

export interface GetDepositAllowanceProps {
  network: Network;
  accountAddress: string;
  tokenAddress: string;
  vaultAddress: string;
}

export interface GetWithdrawAllowanceProps {
  network: Network;
  accountAddress: string;
  tokenAddress: string;
  vaultAddress: string;
}

export interface ApproveProps {
  network: Network;
  accountAddress: Address;
  tokenAddress: Address;
  spenderAddress: Address;
  amount: Wei;
}

// *************** TRANSACTION ***************

export interface TransactionService {
  execute: (props: ExecuteTransactionProps) => Promise<TransactionResponse>;

  populateTransaction(props: ExecuteTransactionProps): Promise<PopulatedTransaction>;

  handleTransaction: (props: HandleTransactionProps) => Promise<TransactionReceipt>;
}

export interface ExecuteTransactionProps {
  network: Network;
  args?: Array<any>;
  overrides?: Overrides;
  methodName: string;
  abi: any;
  contractAddress: Address;
}

export interface HandleTransactionProps {
  tx: TransactionResponse;
  network: Network;
  useExternalService?: boolean;
  renderNotification?: boolean;
}

// *************** GAS ***************

export interface GasService {
  getGasFees: () => Promise<GasFees>;
}

// *************** SUBSCRIPTION ***************
export interface SubscriptionProps {
  module: string;
  event: string;
  action: (...args: any[]) => void;
}

export interface SubscriptionService {
  subscribe: (props: SubscriptionProps) => void;
  unsubscribe: (props: SubscriptionProps) => void;
}
