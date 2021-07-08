import { TransactionRequest, TransactionResponse, TransactionReceipt } from '@ethersproject/providers';

import {
  Position,
  Asset,
  Vault,
  Yearn,
  Balance,
  VaultDynamic,
  Token,
  TokenAmount,
  Address,
  Integer,
  Usdc,
  Apy,
  VaultStatic,
  IronBankMarket,
  IronBankUserSummary,
  VaultsUserSummary,
  IronBankMarketDynamic,
  CyTokenUserMetadata,
  VaultUserMetadata,
} from '@yfi/sdk';

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
}

interface LabUserMetadata {}

interface TransactionOutcome {
  sourceTokenAddress: Address;
  sourceTokenAmount: Integer;
  targetTokenAddress: Address;
  targetTokenAmount: Integer;
  targetUnderlyingTokenAddress?: Address;
  targetUnderlyingTokenAmount?: Integer;
  conversionRate?: number;
  slippage?: number;
}

export type {
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
  IronBankMarket,
  IronBankUserSummary,
  VaultsUserSummary,
  IronBankMarketDynamic,
  CyTokenUserMetadata,
  Lab,
  LabStatic,
  LabDynamic,
  LabMetadata,
  LabUserMetadata,
  TransactionRequest,
  TransactionResponse,
  TransactionReceipt,
  TransactionOutcome,
  VaultUserMetadata,
};
