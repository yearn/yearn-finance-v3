import { Vault, Position, TokenPriced, Apy } from '@yfi/sdk';
import { BigNumber } from '@frameworks/ethers';
import IronBankGetMockData from './mock/IronBankGetMockData.json';
import IronBankPositionMockData from './mock/IronBankPositionMockData.json';
import VaultsV2MockData from './mock/VaultsV2MockData.json';
import VaultsV2PositionsMockData from './mock/VaultsV2PositionsMockData.json';
import TokensMockData from './mock/TokenMockData.json';
import { getAddress } from '@ethersproject/address';

const tokens = {
  supported: (): TokenPriced[] => {
    return TokensMockData.map((token) => ({
      id: getAddress(token.address),
      name: token.symbol,
      symbol: token.symbol,
      decimals: BigNumber.from(token.decimals),
      price: BigNumber.from(Math.floor(Number(token.price) * 1e6)),
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
};

export const yearnSdkMock = {
  tokens,
  vaults,
  ironBank,
};
