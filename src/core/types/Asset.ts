import { BigNumber } from '@ethersproject/bignumber';

import { Metadata, TypeId } from './Metadata';

export type Address = string;

export interface Position {
  assetId: Address;
  tokenId: Address;
  typeId: string;
  balance: BigNumber;
  underlyingTokenBalance: TokenAmount;
  assetAllowances: Allowance[];
  tokenAllowances: Allowance[];
}

export interface Allowance {
  owner: Address;
  spender: Address;
  amount: BigNumber;
}

export interface Token {
  id: Address;
  name: string;
  symbol: string;
  decimals: BigNumber;
}

export interface TokenAmount {
  amount: BigNumber;
  amountUsdc: BigNumber;
}

export interface TokenPriced extends Token {
  price: BigNumber;
}

export type Icon = string | undefined;
export type IconMap<T extends Address> = { [K in T]: Icon };

/// Assets

export interface AssetStatic<T extends TypeId> {
  id: Address;
  typeId: T;
  name: string;
  version: string;
  token: Token;
}

export interface AssetDynamic<T extends TypeId> {
  id: Address;
  typeId: T;
  tokenId: Address;
  underlyingTokenBalance: TokenAmount;
  metadata: Metadata[T];
}

export type Asset<T extends TypeId> = AssetStatic<T> & AssetDynamic<T> & { typeId: T };

export type GenericAsset = Asset<'VAULT_V1'> | Asset<'VAULT_V2'>;
