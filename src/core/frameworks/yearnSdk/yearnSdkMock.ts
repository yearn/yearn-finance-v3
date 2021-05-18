import { Balance, Position, Token, Vault, VaultDynamic, Usdc, VaultStatic } from '@types';
import { BigNumber } from '@frameworks/ethers';
import IronBankGetMockData from './mock/IronBankGetMockData.json';
import IronBankPositionMockData from './mock/IronBankPositionMockData.json';
import VaultsV2MockData from './mock/VaultsV2MockData.json';
import VaultsV2PositionsMockData from './mock/VaultsV2PositionsMockData.json';
import UserTokensMockData from './mock/UserTokensMockData.json';
import TokensMockData from './mock/TokenMockData.json';
import { getAddress } from '@ethersproject/address';

const tokens = {
  supported: (): Token[] => {
    return TokensMockData.map((token) => ({
      address: getAddress(token.address),
      name: token.symbol,
      symbol: token.symbol,
      decimals: token.decimals.toString(),
      icon: 'MOCK',
      priceUsdc: token.price.toString(),
      supported: {
        zapper: true,
      },
    }));
  },
  priceUsdc: (tokenAddresses: string[]): { [address: string]: Usdc } => {
    const tokensPricesMap: any = {};
    tokenAddresses.forEach((address) => (tokensPricesMap[address] = '44.09'));
    return tokensPricesMap;
  },
  balances: (address: string): Balance[] => {
    return UserTokensMockData.map((userTokenData) => {
      return {
        address: userTokenData.address,
        balance: userTokenData.balance,
        balanceUsdc: userTokenData.balanceUsdc,
        token: {
          address: userTokenData.address,
          decimals: userTokenData.decimals.toString(),
          name: userTokenData.symbol,
          symbol: userTokenData.symbol,
        },
        priceUsdc: userTokenData.price.toString(),
      };
    });
  },
};

const vaults = {
  get: (): Vault[] => {
    const staticVaultsData = VaultsV2MockData.static;
    const dynamicVaultsData = VaultsV2MockData.dynamic;

    const vaults: Vault[] = staticVaultsData.map((staticData, i) => {
      const dynamicData = dynamicVaultsData[i];
      const vault = { ...staticData, ...dynamicData };
      return {
        ...vault,
        typeId: 'VAULT_V2',
      };
    });
    return vaults;
  },
  assetsPositionsOf: (userAddress: string, vaultAddresses?: string[]): Position[] => {
    // if (vaultAddresses?.length) {
    //   const position = VaultsV2PositionsMockData[3].positions[0];
    //   return [
    //     {
    //       ...position,
    //       underlyingTokenBalance: {
    //         amount: '999999999999999',
    //         amountUsdc: '999999999999999',
    //       },
    //     },
    //   ];
    // }

    const vaultsPositions: Position[] = [];
    VaultsV2PositionsMockData.forEach((data) => {
      vaultsPositions.push(...data.positions);
    });

    return vaultsPositions;
  },
  getStatic: (addresses?: string[]): VaultStatic[] => {
    const vaultStaticData: VaultStatic = { ...VaultsV2MockData.static[0], typeId: 'VAULT_V2' };

    return [vaultStaticData];
  },
  getDynamic: (addresses?: string[]): VaultDynamic[] => {
    const vaultDynamicData: VaultDynamic = { ...VaultsV2MockData.dynamic[0], typeId: 'VAULT_V2' };

    return [vaultDynamicData];
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
