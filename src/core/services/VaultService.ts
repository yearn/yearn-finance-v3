// import BigNumber from 'bignumber.js';
// import { ethers } from 'ethers';

import { notify } from '@frameworks/blocknative';
import { getContract } from '@frameworks/ethers';
import {
  VaultService,
  VaultData,
  Web3Provider,
  YearnSdk,
  Config,
  DepositProps,
  WithdrawProps,
  VaultDynamicData,
  UserVaultData,
  EthereumAddress,
} from '@types';
import yVaultAbi from './contracts/yVault.json';
import erc20Abi from './contracts/erc20.json';
import { VaultDynamic } from '@yfi/sdk';
import { BigNumber } from '@ethersproject/bignumber';

export class VaultServiceImpl implements VaultService {
  private web3Provider: Web3Provider;
  private yearnSdk: YearnSdk;
  private config: Config;

  constructor({ web3Provider, yearnSdk, config }: { web3Provider: Web3Provider; yearnSdk: YearnSdk; config: Config }) {
    this.web3Provider = web3Provider;
    this.yearnSdk = yearnSdk;
    this.config = config;
  }

  public async getSupportedVaults(): Promise<VaultData[]> {
    const yearn = this.yearnSdk;
    const vaults = await yearn.vaults.get();
    const vaultDataPromise = vaults.map(async (vault) => {
      const apy = await yearn.vaults.apy(vault.id);
      return {
        address: vault.id,
        name: vault.name,
        version: vault.version,
        typeId: vault.typeId,
        balance: vault.underlyingTokenBalance.amount.toString(),
        balanceUsdc: vault.underlyingTokenBalance.amountUsdc.toString(),
        token: vault.token.id,
        apyData: apy ? apy.recommended.toString() : '0',
        depositLimit: vault.typeId === 'VAULT_V2' ? vault.metadata.depositLimit.toString() : '0',
        pricePerShare: vault.metadata.pricePerShare.toString(),
      };
    });
    const vaultData = Promise.all(vaultDataPromise);
    return vaultData;
  }

  public async getVaultsDynamicData(addresses: string[] | undefined): Promise<VaultDynamicData[]> {
    const yearn = this.yearnSdk;
    // const vaultsDynamicData: VaultDynamic[] = await yearn.vaults.getDynamicData(addresses); // use when sdk ready.
    // TODO remove mock when sdk ready.
    const mockDynamicData: VaultDynamic = {
      id: 'asd',
      typeId: 'VAULT_V2',
      tokenId: 'asd',
      underlyingTokenBalance: {
        amount: BigNumber.from(0),
        amountUsdc: BigNumber.from(0),
      },
      metadata: {
        symbol: 'asd',
        pricePerShare: BigNumber.from(0),
        migrationAvailable: false,
        latestVaultAddress: 'asd',
        depositLimit: BigNumber.from(0),
        emergencyShutdown: false,
      },
    };
    const vaultsDynamicData: VaultDynamic[] = [mockDynamicData]; // remove when sdk ready.
    const vaultDataPromise = vaultsDynamicData.map(async (vault) => {
      const apy = await yearn.vaults.apy(vault.id);
      return {
        address: vault.id,
        balance: vault.underlyingTokenBalance.amount.toString(),
        balanceUsdc: vault.underlyingTokenBalance.amountUsdc.toString(),
        apyData: apy ? apy.recommended.toString() : '0',
        depositLimit: vault.typeId === 'VAULT_V2' ? vault.metadata.depositLimit.toString() : '0',
        pricePerShare: vault.metadata.pricePerShare.toString(),
      };
    });
    const vaultData = Promise.all(vaultDataPromise);
    return vaultData;
  }

  public async getUserVaultsData({ userAddress }: { userAddress: EthereumAddress }): Promise<UserVaultData[]> {
    const yearn = this.yearnSdk;
    const userVaults = await yearn.vaults.positionsOf(userAddress);
    const userVaultsData: UserVaultData[] = userVaults.map((vault) => {
      const allowancesMap: any = {};
      vault.assetAllowances.forEach((allowance) => {
        allowancesMap[allowance.spender] = allowance.amount.toString();
      });
      const tokenAllowancesMap: any = {};
      vault.tokenAllowances.forEach((allowance) => {
        tokenAllowancesMap[allowance.spender] = allowance.amount.toString();
      });

      return {
        address: vault.assetId,
        depositedBalance: vault.accountTokenBalance.amount.toString(),
        depositedBalanceUsdc: vault.accountTokenBalance.amountUsdc.toString(),
        allowancesMap: allowancesMap,
        tokenPosition: {
          address: vault.tokenId,
          balance: vault.underlyingTokenBalance.amount.toString(),
          balanceUsdc: vault.underlyingTokenBalance.amountUsdc.toString(),
          allowancesMap: tokenAllowancesMap,
        },
      };
    });

    return userVaultsData;
  }

  public async deposit(props: DepositProps): Promise<void> {
    const { tokenAddress, vaultAddress, amount } = props;
    const { ETHEREUM_ADDRESS } = this.config;
    const signer = this.web3Provider.getSigner();
    const vaultContract = getContract(vaultAddress, yVaultAbi, signer);
    if (tokenAddress === ETHEREUM_ADDRESS) {
      const transaction = await vaultContract.depositETH(amount);
      console.log('Transaction: ', transaction);
      notify.hash(transaction.hash);
      const receipt = await transaction.wait(1);
      console.log('Receipt: ', receipt);
    } else {
      const transaction = await vaultContract.deposit(amount);
      console.log('Transaction: ', transaction);
      notify.hash(transaction.hash);
      const receipt = await transaction.wait(1);
      console.log('Receipt: ', receipt);
    }
  }

  public async withdraw(props: WithdrawProps): Promise<void> {
    const { vaultAddress, amountOfShares } = props;
    const signer = this.web3Provider.getSigner();
    const vaultContract = getContract(vaultAddress, yVaultAbi, signer);

    // withdrawAll ??
    // if (amount === MAX_UINT256) {
    //   const transaction = await vaultContract.withdraw();
    //   console.log('Transaction: ', transaction);
    //   const receipt = await transaction.wait(1);
    //   console.log('Receipt: ', receipt);
    // }

    const transaction = await vaultContract.withdraw(amountOfShares);
    console.log('Transaction: ', transaction);
    notify.hash(transaction.hash);
    const receipt = await transaction.wait(1);
    console.log('Receipt: ', receipt);
  }
}
