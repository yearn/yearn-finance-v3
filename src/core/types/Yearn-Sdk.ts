import { TransactionRequest, TransactionResponse, TransactionReceipt } from '@ethersproject/providers';
import { Overrides } from '@ethersproject/contracts';
import {
  Yearn,
  Position,
  Asset,
  Vault,
  Balance,
  VaultDynamic,
  Token,
  TokenAmount,
  Address,
  Integer,
  Usdc,
  Apy,
  VaultStatic,
  VaultsUserSummary,
  VaultUserMetadata,
  TransactionOutcome,
  EarningsDayData,
  StrategyMetadata,
  TokenAllowance,
} from '@yfi/sdk';

import { Network } from './Blockchain';

type SdkNetwork = 1 | 250;
interface YearnSdk {
  hasInstanceOf: (network: Network) => boolean;
  getInstanceOf: (network: Network) => Yearn<SdkNetwork>;
  register: (network: Network, instance: Yearn<SdkNetwork>) => void;
}

type ZapInType = keyof Token['supported']; // TODO: import from SDK once is updated
type ZapOutType = keyof Token['supported']; // TODO: import from SDK once is updated

declare type Lab = LabStatic & LabDynamic;
interface LabStatic {
  address: Address;
  typeId: 'LAB';
  token: Address;
  name: string;
  version: string;
  symbol: string;
  decimals: string;
}

interface LabDynamic {
  address: Address;
  typeId: 'LAB';
  tokenId: Address;
  underlyingTokenBalance: TokenAmount;
  metadata: LabMetadata;
}

interface LabMetadata {
  pricePerShare: Integer;
  apy?: Apy;
  icon?: string;
  depositLimit: string;
  emergencyShutdown: boolean;
  displayName: string;
  displayIcon: string;
  defaultDisplayToken: Address;
  zapInWith?: ZapInType;
  zapOutWith?: ZapOutType;
}

interface LabUserMetadata {}

export type {
  SdkNetwork,
  YearnSdk,
  Position,
  Asset,
  Vault,
  Yearn,
  Balance,
  VaultDynamic,
  Token,
  Integer,
  Usdc,
  VaultStatic,
  VaultsUserSummary,
  Lab,
  LabStatic,
  LabDynamic,
  LabMetadata,
  LabUserMetadata,
  TransactionRequest,
  TransactionResponse,
  TransactionReceipt,
  TransactionOutcome,
  Overrides,
  VaultUserMetadata,
  EarningsDayData,
  StrategyMetadata,
  Apy,
  TokenAllowance,
  ZapInType,
  ZapOutType,
};
