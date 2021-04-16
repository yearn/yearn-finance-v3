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
  ApproveDepositProps,
  DepositProps,
  WithdrawProps,
} from '@types';
import yVaultAbi from './contracts/yVault.json';
// import v2VaultAbi from './contracts/v2Vault.json';
import erc20Abi from './contracts/erc20.json';

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
        address: vault.id.toLowerCase(),
        name: vault.name,
        version: vault.version,
        typeId: vault.typeId,
        balance: vault.underlyingTokenBalance.amount.toString(),
        balanceUsdc: vault.underlyingTokenBalance.amountUsdc.toString(),
        token: vault.token.id.toLowerCase(),
        apyData: apy ? apy.recommended.toString() : '0',
        depositLimit: vault.typeId === 'VAULT_V2' ? vault.metadata.depositLimit.toString() : '0',
        pricePerShare: vault.metadata.pricePerShare.toString(),
      };
    });
    const vaultData = Promise.all(vaultDataPromise);
    return vaultData;
  }

  public async approveDeposit(props: ApproveDepositProps): Promise<void> {
    const { tokenAddress, vaultAddress, amount } = props;
    const signer = this.web3Provider.getSigner();
    const erc20Contract = getContract(tokenAddress, erc20Abi, signer);
    const transaction = await erc20Contract.approve(vaultAddress, amount);
    console.log('Transaction: ', transaction);
    notify.hash(transaction.hash);
    const receipt = await transaction.wait(1);
    console.log('Receipt: ', receipt);
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
