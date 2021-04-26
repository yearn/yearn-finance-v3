import { Vault, Position, Apy } from '@yfi/sdk';
import { BigNumber } from '@frameworks/ethers';
import IronBankGetMockData from './mock/IronBankGetMockData.json';
import IronBankPositionMockData from './mock/IronBankPositionMockData.json';
import VaultsV2MockData from './mock/VaultsV2MockData.json';
import VaultsV2PositionsMockData from './mock/VaultsV2PositionsMockData.json';
import TokensMockData from './mock/TokenMockData.json';
import { getAddress } from '@ethersproject/address';
import { TokenData } from '../../types';

const tokens = {
  supported: (): TokenData[] => {
    return TokensMockData.map((token) => ({
      address: getAddress(token.address),
      name: token.symbol,
      symbol: token.symbol,
      decimals: token.decimals,
      icon: 'MOCK',
      priceUsdc: token.price.toString(),
      isZapperSupported: true,
    }));
  },
  //   dynamicData: () => {
  //     console.log('Mock: tokens.dynamicData()');
  //   },
};

const vaults = {
  get: (): Vault[] => {
    const staticVaultsData = VaultsV2MockData.static;
    const dynamicVaultsData = VaultsV2MockData.dynamic;

    const vaults: Vault[] = staticVaultsData.map((staticData, i) => {
      const dynamicData = dynamicVaultsData[i];

      return {
        id: staticData.id,
        typeId: 'VAULT_V2',
        name: staticData.name,
        version: staticData.version,
        token: {
          id: staticData.token.id,
          name: staticData.token.name,
          symbol: staticData.token.symbol,
          decimals: BigNumber.from(staticData.token.decimals),
        },
        tokenId: dynamicData.tokenId,
        underlyingTokenBalance: {
          amount: BigNumber.from(dynamicData.underlyingTokenBalance.amount),
          amountUsdc: BigNumber.from(dynamicData.underlyingTokenBalance.amountUsdc),
        },
        metadata: {
          symbol: dynamicData.metadata.symbol,
          pricePerShare: BigNumber.from(dynamicData.metadata.pricePerShare),
          migrationAvailable: dynamicData.metadata.migrationAvailable,
          latestVaultAddress: dynamicData.metadata.latestVaultAddress,
          depositLimit: BigNumber.from(dynamicData.metadata.depositLimit),
          emergencyShutdown: dynamicData.metadata.emergencyShutdown,
        },
      };
    });
    return vaults;
  },
  positionsOf: (): Position[] => {
    const vaultsPositions = VaultsV2PositionsMockData.map((data) => {
      const position = data.positions[0];
      return {
        ...position,
        balance: BigNumber.from(position.balance),
        accountTokenBalance: {
          amount: BigNumber.from(position.accountTokenBalance.amount),
          amountUsdc: BigNumber.from(position.accountTokenBalance.amountUsdc),
        },
        underlyingTokenBalance: {
          amount: BigNumber.from(position.underlyingTokenBalance.amount),
          amountUsdc: BigNumber.from(position.underlyingTokenBalance.amountUsdc),
        },
        assetAllowances: position.assetAllowances,
        tokenAllowances: position.tokenAllowances,
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
  positionsOf: () => {
    return IronBankPositionMockData.map((cyTokenPosition) => {
      const positions = cyTokenPosition.positions.map((position) => ({
        ...position,
        balance: BigNumber.from(position.balance),
        accountTokenBalance: {
          amount: BigNumber.from(position.accountTokenBalance.amount),
          amountUsdc: BigNumber.from(position.accountTokenBalance.amountUsdc),
        },
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
