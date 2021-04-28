import { Vault, Position, Apy, Token } from '@yfi/sdk';
import { BigNumber } from '@frameworks/ethers';
import IronBankGetMockData from './mock/IronBankGetMockData.json';
import IronBankPositionMockData from './mock/IronBankPositionMockData.json';
import VaultsV2MockData from './mock/VaultsV2MockData.json';
import VaultsV2PositionsMockData from './mock/VaultsV2PositionsMockData.json';
import TokensMockData from './mock/TokenMockData.json';
import { getAddress } from '@ethersproject/address';
import { TokenData, UserVaultData, VaultData, VaultDynamicData } from '../../types';

const tokens = {
  supported: (): TokenData[] => {
    // change this to use Token model when updated in the sdk
    return TokensMockData.map((token) => ({
      address: getAddress(token.address),
      name: token.symbol,
      symbol: token.symbol,
      decimals: token.decimals,
      icon: 'MOCK',
      priceUsdc: token.price.toString(),
      supported: {
        zapper: true,
      },
    }));
  },
  //   dynamicData: () => {
  //     console.log('Mock: tokens.dynamicData()');
  //   },
};

const vaults = {
  get: (): VaultData[] => {
    const staticVaultsData = VaultsV2MockData.static;
    const dynamicVaultsData = VaultsV2MockData.dynamic;

    const vaults: VaultData[] = staticVaultsData.map((staticData, i) => {
      const dynamicData = dynamicVaultsData[i];
      const vault = { ...staticData, ...dynamicData };
      return {
        address: vault.id,
        name: vault.name,
        version: vault.version,
        typeId: 'VAULT_V2',
        balance: vault.underlyingTokenBalance.amount.toString(),
        balanceUsdc: vault.underlyingTokenBalance.amountUsdc.toString(),
        token: vault.token.id,
        apyData: '99',
        depositLimit: vault.typeId === 'VAULT_V2' ? vault.metadata.depositLimit.toString() : '0',
        pricePerShare: vault.metadata.pricePerShare.toString(),
        migrationAvailable: vault.typeId === 'VAULT_V2' ? vault.metadata.migrationAvailable : false,
        latestVaultAddress: vault.typeId === 'VAULT_V2' ? vault.metadata.latestVaultAddress : '',
        emergencyShutdown: vault.typeId === 'VAULT_V2' ? vault.metadata.emergencyShutdown : false,
        symbol: vault.metadata.symbol,
      };
    });
    return vaults;
  },
  assetsPositionsOf: (userAddress: string): UserVaultData[] => {
    const vaultsPositions = VaultsV2PositionsMockData.map((data) => {
      const position = data.positions[0];
      return {
        address: position.assetId,
        depositedBalance: position.underlyingTokenBalance.amount.toString(),
        depositedBalanceUsdc: position.underlyingTokenBalance.amountUsdc.toString(),
        allowancesMap: {},
      };
    });

    return vaultsPositions;
  },
  assetsDynamicData: (addresses?: string[]): VaultDynamicData[] => {
    const vaultsPositions = [VaultsV2MockData.dynamic[0]].map((dynamicData) => {
      return {
        address: dynamicData.id,
        balance: dynamicData.underlyingTokenBalance.amount.toString(),
        balanceUsdc: dynamicData.underlyingTokenBalance.amountUsdc.toString(),
        apyData: '800',
        depositLimit: dynamicData.typeId === 'VAULT_V2' ? dynamicData.metadata.depositLimit.toString() : '0',
        pricePerShare: dynamicData.metadata.pricePerShare.toString(),
        migrationAvailable: dynamicData.typeId === 'VAULT_V2' ? dynamicData.metadata.migrationAvailable : false,
        latestVaultAddress: dynamicData.typeId === 'VAULT_V2' ? dynamicData.metadata.latestVaultAddress : '',
        emergencyShutdown: dynamicData.typeId === 'VAULT_V2' ? dynamicData.metadata.emergencyShutdown : false,
      };
    });

    return vaultsPositions;
  },
  apy: (vaultAddress: string): Apy | undefined => {
    return {
      recommended: 99,
      composite: false,
      type: '',
      description: '',
      data: {},
    };
  },
};

const ironBank = {
  get: () => {
    return IronBankGetMockData.map((cyToken) => ({
      ...cyToken,
      underlyingTokenBalance: {
        amount: BigNumber.from(cyToken.underlyingTokenBalance.amount),
        amountUsdc: BigNumber.from(cyToken.underlyingTokenBalance.amountUsdc),
      },
      metadata: {
        ...cyToken.metadata,
        lendApy: parseFloat(cyToken.metadata.lendAPY) / 100,
        borrowApy: parseFloat(cyToken.metadata.borrowAPY) / 100,
        decimals: BigNumber.from(cyToken.metadata.decimals),
        liquidity: BigNumber.from(cyToken.metadata.liqudity),
      },
    }));
  },
  assetsPositionsOf: () => {
    return IronBankPositionMockData.map((cyTokenPosition) => {
      const positions = cyTokenPosition.positions.map((position) => ({
        ...position,
        balance: BigNumber.from(position.balance),
        underlyingTokenBalance: {
          amount: BigNumber.from(position.underlyingTokenBalance.amount),
          amountUsdc: BigNumber.from(position.underlyingTokenBalance.amountUsdc),
        },
      }));
      return {
        positions,
        metadata: {
          ...cyTokenPosition.metadata,
          borrowLimit: BigNumber.from(cyTokenPosition.metadata.borrowLimit),
        },
      };
    });
  },
  getIronBank: () => {
    return {
      address: '0x000...',
      userAssetMetadata: {
        borrowLimit: BigNumber.from('100'),
        borrowLimitUSed: BigNumber.from('30'),
      },
    };
  },
};

export const yearnSdkMock = {
  tokens,
  vaults,
  ironBank,
};
