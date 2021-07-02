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
  IronBankPosition,
  IronBankMarketDynamic,
  CyTokenUserMetadata,
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
}

interface LabUserMetadata {}

interface TransactionOutcome {
  sourceTokenAddress: Address;
  sourceTokenAmount: Integer;
  targetTokenAddress: Address;
  targetTokenAmount: Integer;
  targetUnderlyingTokenAddress: Address;
  targetUnderlyingTokenAmount: TokenAmount;
  conversionRate: number;
  slippage: number;
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
  IronBankPosition,
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
};
