import { Yearn, Metadata } from '@yfi/sdk';
import BigNumber from 'bignumber.js';

import { getContract, formatUnits } from '@frameworks/ethers';
import {
  VaultService,
  VaultData,
  Web3Provider,
  Config,
  ApproveDepositProps,
  DepositProps,
  WithdrawProps,
} from '@types';
import yVaultAbi from './contracts/yVault.json';
import erc20Abi from './contracts/erc20.json';

export class VaultServiceImpl implements VaultService {
  private web3Provider: Web3Provider;
  private config: Config;

  constructor({ web3Provider, config }: { web3Provider: Web3Provider; config: Config }) {
    this.web3Provider = web3Provider;
    this.config = config;
  }

  public async getSupportedVaults(): Promise<VaultData[]> {
    const provider = this.web3Provider.getInstanceOf('fantom');
    const yearn = new Yearn(250, { provider });
    const vaults = await yearn.vaults.get();
    const vaultData: VaultData[] = vaults.map((vault) => ({
      address: vault.id,
      name: vault.name,
      version: vault.version,
      typeId: vault.typeId,
      balance: vault.balance?.toString() ?? '0',
      balanceUsdc: vault.balanceUsdc?.toString() ?? '0',
      token: vault.token.id,
      apyData: undefined,
      depositLimit: (vault.metadata as Metadata['VAULT_V2']).depositLimit?.toString() ?? '0',
    }));

    return vaultData;
  }

  public async approveDeposit(props: ApproveDepositProps): Promise<void> {
    const { tokenAddress, vaultAddress, amount } = props;
    const signer = this.web3Provider.getSigner();
    const erc20Contract = getContract(tokenAddress, erc20Abi, signer);
    const transaction = await erc20Contract.approve(vaultAddress, amount);
    console.log('Transaction: ', transaction);
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
      const receipt = await transaction.wait(1);
      console.log('Receipt: ', receipt);
    } else {
      const transaction = await vaultContract.deposit(amount);
      console.log('Transaction: ', transaction);
      const receipt = await transaction.wait(1);
      console.log('Receipt: ', receipt);
    }
  }

  public async withdraw(props: WithdrawProps): Promise<void> {
    const { tokenAddress, vaultAddress, amount, vaultType } = props;
    const signer = this.web3Provider.getSigner();
    const vaultContract = getContract(vaultAddress, yVaultAbi, signer);

    // withdrawAll ??
    // if (amount === MAX_UINT256) {
    //   const transaction = await vaultContract.withdraw();
    //   console.log('Transaction: ', transaction);
    //   const receipt = await transaction.wait(1);
    //   console.log('Receipt: ', receipt);
    // }

    const erc20Contract = getContract(tokenAddress, erc20Abi, signer);
    const decimals = vaultType === 'v1' ? 18 : await erc20Contract.decimals();
    const pricePerShare =
      vaultType === 'v1' ? await vaultContract.getPricePerFullShare() : await vaultContract.pricePerShare();
    const sharePrice = formatUnits(pricePerShare, decimals);
    const amountOfShares = new BigNumber(amount).dividedBy(sharePrice).decimalPlaces(0).toFixed(0);

    const transaction = await vaultContract.withdraw(amountOfShares);
    console.log('Transaction: ', transaction);
    const receipt = await transaction.wait(1);
    console.log('Receipt: ', receipt);
  }
}
