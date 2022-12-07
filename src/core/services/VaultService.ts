import { getContract, signTypedData } from '@frameworks/ethers';
import { toBN, normalizeAmount, getProviderType } from '@utils';
import {
  VaultService,
  YearnSdk,
  SignPermitProps,
  DepositProps,
  WithdrawProps,
  MigrateProps,
  Position,
  Vault,
  VaultDynamic,
  TransactionResponse,
  GetSupportedVaultsProps,
  GetExpectedTransactionOutcomeProps,
  TransactionOutcome,
  GetUserVaultsSummaryProps,
  VaultsUserSummary,
  GetUserVaultsMetadataProps,
  VaultUserMetadata,
  GetVaultsDynamicDataProps,
  GetUserVaultsPositionsProps,
  Web3Provider,
  TransactionService,
  Config,
  ApproveDepositProps,
  ApproveWithdrawProps,
  GetDepositAllowanceProps,
  GetWithdrawAllowanceProps,
  TokenAllowance,
  GaslessDepositProps,
  GaslessWithdrawProps,
} from '@types';

import v2VaultAbi from './contracts/v2Vault.json';
import eip2612Abi from './contracts/eip2612.json';
import trustedVaultMigratorAbi from './contracts/trustedVaultMigrator.json';
import triCryptoVaultMigratorAbi from './contracts/triCryptoVaultMigrator.json';

export class VaultServiceImpl implements VaultService {
  private yearnSdk: YearnSdk;
  private web3Provider: Web3Provider;
  private transactionService: TransactionService;
  private config: Config;

  constructor({
    yearnSdk,
    web3Provider,
    transactionService,
    config,
  }: {
    yearnSdk: YearnSdk;
    web3Provider: Web3Provider;
    transactionService: TransactionService;
    config: Config;
  }) {
    this.yearnSdk = yearnSdk;
    this.web3Provider = web3Provider;
    this.transactionService = transactionService;
    this.config = config;
  }

  /* -------------------------------------------------------------------------- */
  /*                                 Fetch Methods                              */
  /* -------------------------------------------------------------------------- */

  public async getSupportedVaults({ network, addresses }: GetSupportedVaultsProps): Promise<Vault[]> {
    const { YVBOOST } = this.config.CONTRACT_ADDRESSES;
    const yearn = this.yearnSdk.getInstanceOf(network);
    const vaults = await yearn.vaults.get(addresses);
    // TODO: Once SDK has a Labs interface, filtering out yvBoost should not be needed anymore
    return vaults.filter(({ address }) => address !== YVBOOST);
  }

  public async getVaultsDynamicData({ network, addresses }: GetVaultsDynamicDataProps): Promise<VaultDynamic[]> {
    const yearn = this.yearnSdk.getInstanceOf(network);
    return await yearn.vaults.getDynamic(addresses);
  }

  public async getUserVaultsPositions({
    network,
    userAddress,
    vaultAddresses,
  }: GetUserVaultsPositionsProps): Promise<Position[]> {
    const yearn = this.yearnSdk.getInstanceOf(network);
    return await yearn.vaults.positionsOf(userAddress, vaultAddresses);
  }

  public async getUserVaultsSummary({ network, userAddress }: GetUserVaultsSummaryProps): Promise<VaultsUserSummary> {
    const yearn = this.yearnSdk.getInstanceOf(network);
    return await yearn.vaults.summaryOf(userAddress);
  }

  public async getUserVaultsMetadata(props: GetUserVaultsMetadataProps): Promise<VaultUserMetadata[]> {
    const { network, userAddress, vaultsAddresses } = props;
    const yearn = this.yearnSdk.getInstanceOf(network);
    return await yearn.vaults.metadataOf(userAddress, vaultsAddresses);
  }

  public async getExpectedTransactionOutcome(props: GetExpectedTransactionOutcomeProps): Promise<TransactionOutcome> {
    const {
      network,
      transactionType,
      accountAddress,
      sourceTokenAddress,
      sourceTokenAmount,
      targetTokenAddress,
      gasless,
    } = props;
    const { NETWORK_SETTINGS } = this.config;
    const currentNetworkSettings = NETWORK_SETTINGS[network];
    const DEFAULT_SLIPPAGE_SIMULATION = 0.99;
    const yearn = this.yearnSdk.getInstanceOf(network);

    if (!currentNetworkSettings.simulationsEnabled) {
      const tokenAddress = transactionType === 'DEPOSIT' ? sourceTokenAddress : targetTokenAddress;
      const priceUsdc = await yearn.tokens.priceUsdc(tokenAddress);
      const tokens = await yearn.vaults.tokens();
      const decimals = tokens.find((token) => token.address === tokenAddress)?.decimals;
      let underlyingTokenAmount = sourceTokenAmount;

      if (transactionType === 'WITHDRAW') {
        const providerType = getProviderType(network);
        const provider = this.web3Provider.getInstanceOf(providerType);
        const vaultContract = getContract(sourceTokenAddress, v2VaultAbi, provider);
        const pricePerShare = await vaultContract.pricePerShare();
        underlyingTokenAmount = toBN(sourceTokenAmount)
          .times(normalizeAmount(pricePerShare.toString(), toBN(decimals).toNumber()))
          .toFixed(0);
      }

      const targetTokenAmountUsdc = toBN(normalizeAmount(underlyingTokenAmount, toBN(decimals).toNumber()))
        .times(priceUsdc)
        .toFixed(0);

      return {
        sourceTokenAddress,
        sourceTokenAmount,
        targetTokenAddress,
        targetTokenAmount: underlyingTokenAmount, // TODO: CALCULATE CORRECTLY IF NEEDED IN UI LATER
        targetTokenAmountUsdc,
        targetUnderlyingTokenAddress: sourceTokenAddress,
        targetUnderlyingTokenAmount: underlyingTokenAmount,
        conversionRate: 1,
        slippage: 0,
      };
    }

    const expectedOutcome: TransactionOutcome = await yearn.vaults.getExpectedTransactionOutcome({
      transactionType,
      sourceTokenAddress,
      targetTokenAddress,
      sourceTokenAmount,
      accountAddress,
      slippageTolerance: DEFAULT_SLIPPAGE_SIMULATION,
      gasless,
    });

    return expectedOutcome;
  }

  /* -------------------------------------------------------------------------- */
  /*                             Transaction Methods                            */
  /* -------------------------------------------------------------------------- */

  public async signPermit(props: SignPermitProps): Promise<string> {
    const { network, accountAddress, vaultAddress, spenderAddress, amount, deadline } = props;
    const { NETWORK_SETTINGS } = this.config;
    const currentNetworkSettings = NETWORK_SETTINGS[network];

    const signer = this.web3Provider.getSigner();
    const vaultContract = getContract(vaultAddress, v2VaultAbi, signer);
    const apiVersion = await vaultContract.apiVersion();
    const eip2612Contract = getContract(vaultAddress, eip2612Abi, signer);
    const nonce = await eip2612Contract.nonces(accountAddress);

    const domain = {
      name: 'Yearn Vault',
      version: apiVersion.toString(),
      chainId: currentNetworkSettings.networkId,
      verifyingContract: vaultAddress,
    };

    const types = {
      Permit: [
        {
          name: 'owner',
          type: 'address',
        },
        {
          name: 'spender',
          type: 'address',
        },
        {
          name: 'value',
          type: 'uint256',
        },
        {
          name: 'nonce',
          type: 'uint256',
        },
        {
          name: 'deadline',
          type: 'uint256',
        },
      ],
    };

    const message = {
      owner: accountAddress,
      spender: spenderAddress,
      value: amount,
      nonce: nonce.toString(),
      deadline,
    };

    const signature = await signTypedData(signer, domain, types, message);
    return signature;
  }

  public async deposit(props: DepositProps): Promise<TransactionResponse> {
    const { network, accountAddress, tokenAddress, vaultAddress, amount, slippageTolerance } = props;
    const yearn = this.yearnSdk.getInstanceOf(network);
    return await yearn.vaults.deposit(vaultAddress, tokenAddress, amount, accountAddress, {
      slippage: slippageTolerance,
    });
  }

  public async withdraw(props: WithdrawProps): Promise<TransactionResponse> {
    const { network, accountAddress, tokenAddress, vaultAddress, amountOfShares, slippageTolerance, signature } = props;
    const yearn = this.yearnSdk.getInstanceOf(network);
    return await yearn.vaults.withdraw(vaultAddress, tokenAddress, amountOfShares, accountAddress, {
      slippage: slippageTolerance,
      signature,
    });
  }

  public async gaslessDeposit(props: GaslessDepositProps): Promise<string> {
    const { network, accountAddress, tokenAddress, vaultAddress, tokenAmount, vaultAmount, feeAmount } = props;
    const yearn = this.yearnSdk.getInstanceOf(network);
    return await yearn.vaults.gaslessDeposit({
      vaultAddress,
      tokenAddress,
      tokenAmount,
      vaultAmount,
      feeAmount,
      accountAddress,
    });
  }

  public async gaslessWithdraw(props: GaslessWithdrawProps): Promise<string> {
    const { network, accountAddress, tokenAddress, vaultAddress, tokenAmount, vaultAmount, feeAmount } = props;
    const yearn = this.yearnSdk.getInstanceOf(network);
    return await yearn.vaults.gaslessWithdraw({
      vaultAddress,
      tokenAddress,
      tokenAmount,
      vaultAmount,
      feeAmount,
      accountAddress,
    });
  }

  public async migrate(props: MigrateProps): Promise<TransactionResponse> {
    const { network, vaultFromAddress, vaultToAddress, migrationContractAddress } = props;
    const { triCryptoVaultMigrator } = this.config.CONTRACT_ADDRESSES;

    switch (migrationContractAddress) {
      case triCryptoVaultMigrator:
        return await this.transactionService.execute({
          network,
          methodName: 'migrate_to_new_vault',
          contractAddress: migrationContractAddress,
          abi: triCryptoVaultMigratorAbi,
        });

      default:
        return await this.transactionService.execute({
          network,
          methodName: 'migrateAll',
          args: [vaultFromAddress, vaultToAddress],
          contractAddress: migrationContractAddress,
          abi: trustedVaultMigratorAbi,
        });
    }
  }

  public async approveDeposit(props: ApproveDepositProps): Promise<TransactionResponse> {
    const { network, tokenAddress, amount, accountAddress, vaultAddress, gasless } = props;
    const yearn = this.yearnSdk.getInstanceOf(network);

    return yearn.vaults.approveDeposit(accountAddress, vaultAddress, tokenAddress, amount, gasless);
  }

  public async approveWithdraw(props: ApproveWithdrawProps): Promise<TransactionResponse> {
    const { network, vaultAddress, tokenAddress, accountAddress, amount, gasless } = props;
    const yearn = this.yearnSdk.getInstanceOf(network);

    return yearn.vaults.approveWithdraw(accountAddress, vaultAddress, tokenAddress, amount, gasless);
  }

  public async getDepositAllowance({
    network,
    vaultAddress,
    tokenAddress,
    accountAddress,
    gasless,
  }: GetDepositAllowanceProps): Promise<TokenAllowance> {
    const yearn = this.yearnSdk.getInstanceOf(network);
    return await yearn.vaults.getDepositAllowance(accountAddress, vaultAddress, tokenAddress, gasless);
  }

  public async getWithdrawAllowance({
    network,
    vaultAddress,
    tokenAddress,
    accountAddress,
    gasless,
  }: GetWithdrawAllowanceProps): Promise<TokenAllowance> {
    const yearn = this.yearnSdk.getInstanceOf(network);
    return await yearn.vaults.getWithdrawAllowance(accountAddress, vaultAddress, tokenAddress, gasless);
  }
}
