import {
  CyTokenData,
  UserCyTokenData,
  TokenDynamicData,
  EthereumAddress,
  Wei,
  Position,
  Token,
  Vault,
  VaultDynamic,
  Balance,
} from '@types';
import { Integer } from '@yfi/sdk';

export interface UserService {}

export interface VaultService {
  getSupportedVaults: () => Promise<Vault[]>;
  getVaultsDynamicData: (props: any) => Promise<VaultDynamic[]>;
  getUserVaultsData: ({
    userAddress,
    vaultAddresses,
  }: {
    userAddress: EthereumAddress;
    vaultAddresses?: string[];
  }) => Promise<Position[]>;
  deposit: (props: DepositProps) => Promise<void>;
  withdraw: (props: WithdrawProps) => Promise<void>;
  // approveZapIn:
  // zapIn:
  // zapOut:
  // approveMigrate:
  // migrate:
}

export interface TokenService {
  getSupportedTokens: () => Promise<Token[]>;
  getTokensDynamicData: (props: string[]) => Promise<TokenDynamicData[]>;
  getUserTokensData: (accountAddress: string, tokenAddress?: string[]) => Promise<Balance[]>;
  getTokenAllowance: (accountAddress: string, tokenAddress: string, spenderAddress: string) => Promise<Integer>;
  approve: (props: ApproveProps) => Promise<void>;
  // getTokenRates:
}

export interface DepositProps {
  tokenAddress: EthereumAddress;
  vaultAddress: EthereumAddress;
  amount: Wei;
}

export interface WithdrawProps {
  tokenAddress: EthereumAddress;
  vaultAddress: EthereumAddress;
  amountOfShares: Wei;
}

export interface ApproveProps {
  tokenAddress: EthereumAddress;
  spenderAddress: EthereumAddress;
  amount: Wei;
}

export interface IronBankService {
  getSupportedCyTokens: () => Promise<CyTokenData[]>;
  getUserCyTokensData: ({ userAddress }: { userAddress: EthereumAddress }) => Promise<UserCyTokenData[]>;
  getIronBankData: ({ userAddress }: { userAddress: EthereumAddress | undefined }) => Promise<any>;
  // getCyTokensDynamicData: () => Promise<CyTokenDynamicData[]>;
  // approveSupply: (props: ApproveSupplyProps) => Promise<void>;
  // supply: (props: SupplyProps) => Promise<void>;
  // withdraw: (props: WithdrawProps) => Promise<void>;
  // borrow
  // repay
}
