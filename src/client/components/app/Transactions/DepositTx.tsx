import { FC, useState, useEffect } from 'react';
import styled from 'styled-components';
import { keyBy } from 'lodash';

import { useAppSelector, useAppDispatch } from '@hooks';
import { Text } from '@components/common';

import { TokensSelectors, VaultsSelectors, VaultsActions, TokensActions } from '@store';

import { TxActionButton, TxActions, TxSpinnerLoading } from './components/TxActions';
import { TxContainer } from './components/TxContainer';
import { TxTokenInput } from './components/TxTokenInput';
import { TxError } from './components/TxError';
import { TxArrowStatus, TxArrowStatusTypes } from './components/TxArrowStatus';

import {
  toBN,
  formatPercent,
  formatAmount,
  normalizeAmount,
  toWei,
  USDC_DECIMALS,
  validateVaultDeposit,
  validateVaultAllowance,
} from '@src/utils';
import { getConfig } from '@config';

export interface DepositTxProps {
  onClose?: () => void;
}

const StyledDepositTx = styled(TxContainer)``;

export const DepositTx: FC<DepositTxProps> = ({ onClose, children, ...props }) => {
  const { SLIPPAGE_OPTIONS } = getConfig();
  const slippageOptions = SLIPPAGE_OPTIONS.map((value) => ({
    value: value.toString(),
    label: formatPercent(value.toString(), 0),
  }));
  const dispatch = useAppDispatch();
  const [allowVaultSelect, setAllowVaultSelect] = useState(false);
  const [amount, setAmount] = useState('');
  const vaults = useAppSelector(VaultsSelectors.selectVaults);
  const selectedVault = useAppSelector(VaultsSelectors.selectSelectedVault);
  const selectedSellTokenAddress = useAppSelector(TokensSelectors.selectSelectedTokenAddress);
  const userTokens = useAppSelector(TokensSelectors.selectUserTokens);
  const [selectedSlippage, setSelectedSlippage] = useState(slippageOptions[0]);
  const expectedTxOutcome = useAppSelector(VaultsSelectors.selectExpectedTxOutcome);
  const expectedTxOutcomeStatus = useAppSelector(VaultsSelectors.selectExpectedTxOutcomeStatus);
  const actionsStatus = useAppSelector(VaultsSelectors.selectSelectedVaultActionsStatusMap);

  const sellTokensOptions = selectedVault
    ? [selectedVault.token, ...userTokens.filter(({ address }) => address !== selectedVault.token.address)]
    : userTokens;
  const sellTokensOptionsMap = keyBy(sellTokensOptions, 'address');
  const selectedSellToken = sellTokensOptionsMap[selectedSellTokenAddress ?? ''];
  const vaultsOptions = vaults.map(({ address, name, DEPOSIT, token }) => ({
    address,
    symbol: name,
    icon: token.icon,
    balance: DEPOSIT.userDeposited,
    decimals: token.decimals,
  }));

  useEffect(() => {
    if (!selectedSellTokenAddress && selectedVault) {
      dispatch(TokensActions.setSelectedTokenAddress({ tokenAddress: selectedVault.token.address }));
    }

    if (!selectedVault) {
      // TODO: DEFINE DEFAULT SELECTED VAULT ADDRESS CRITERIA
      dispatch(VaultsActions.setSelectedVaultAddress({ vaultAddress: '0xE14d13d8B3b85aF791b2AADD661cDBd5E6097Db1' }));
      setAllowVaultSelect(true);
    }

    return () => {
      // TODO: CREATE A CLEAR SELECTED VAULT/TOKEN ADDRESS ACTION
      dispatch(VaultsActions.setSelectedVaultAddress({ vaultAddress: undefined }));
      dispatch(TokensActions.setSelectedTokenAddress({ tokenAddress: undefined }));
    };
  }, []);

  useEffect(() => {
    if (!selectedVault || !selectedSellTokenAddress) return;

    dispatch(
      TokensActions.getTokenAllowance({
        tokenAddress: selectedSellTokenAddress,
        spenderAddress: selectedVault.address,
      })
    );
  }, [selectedSellTokenAddress]);

  useEffect(() => {
    if (!selectedVault || !selectedSellTokenAddress) return;

    if (toBN(amount).gt(0)) {
      dispatch(
        VaultsActions.getExpectedTransactionOutcome({
          transactionType: 'DEPOSIT',
          sourceTokenAddress: selectedSellTokenAddress,
          sourceTokenAmount: toWei(amount, selectedSellToken.decimals),
          targetTokenAddress: selectedVault.address,
        })
      );
    }
  }, [amount, selectedSellTokenAddress, selectedVault]);

  if (!selectedVault || !selectedSellTokenAddress || !sellTokensOptions) {
    return null;
  }

  const { approved: isApproved, error: allowanceError } = validateVaultAllowance({
    amount: toBN(amount),
    vaultAddress: selectedVault.address,
    vaultUnderlyingTokenAddress: selectedVault.token.address,
    sellTokenAddress: selectedSellTokenAddress,
    sellTokenDecimals: selectedSellToken.decimals.toString(),
    sellTokenAllowancesMap: selectedSellToken.allowancesMap,
  });

  const { approved: isValidAmount, error: inputError } = validateVaultDeposit({
    sellTokenAmount: toBN(amount),
    depositLimit: selectedVault.depositLimit,
    emergencyShutdown: selectedVault.emergencyShutdown,
    sellTokenDecimals: selectedSellToken.decimals.toString(),
    userTokenBalance: selectedSellToken.balance,
    vaultUnderlyingBalance: selectedVault.vaultBalance,
  });

  // TODO: NEED A CLEAR ERROR ACTION ON MODAL UNMOUNT
  const error = allowanceError || inputError || actionsStatus.approve.error || actionsStatus.deposit.error;

  const balance = normalizeAmount(selectedSellToken.balance, selectedSellToken.decimals);
  const vaultBalance = normalizeAmount(selectedVault.DEPOSIT.userDeposited, selectedVault.token.decimals);
  const amountValue = toBN(amount).times(normalizeAmount(selectedSellToken.priceUsdc, USDC_DECIMALS)).toString();
  const expectedAmount = toBN(amount).gt(0)
    ? normalizeAmount(expectedTxOutcome?.targetUnderlyingTokenAmount, selectedVault?.token.decimals)
    : '';
  const expectedAmountValue = toBN(expectedAmount)
    .times(normalizeAmount(selectedVault.token.priceUsdc, USDC_DECIMALS))
    .toString();

  const approve = () =>
    dispatch(
      VaultsActions.approveDeposit({ vaultAddress: selectedVault.address, tokenAddress: selectedSellToken.address })
    );

  const deposit = () =>
    dispatch(
      VaultsActions.depositVault({
        vaultAddress: selectedVault.address,
        tokenAddress: selectedSellToken.address,
        amount: toBN(amount),
        slippageTolerance: toBN(selectedSlippage.value).toNumber(),
      })
    );

  const onSelectedSellTokenChange = (tokenAddress: string) => {
    setAmount('');
    dispatch(TokensActions.setSelectedTokenAddress({ tokenAddress }));
  };

  const onSelectedVaultChange = (vaultAddress: string) => {
    setAmount('');
    dispatch(VaultsActions.setSelectedVaultAddress({ vaultAddress }));
  };

  const txStatus: TxArrowStatusTypes = 'preparing';

  return (
    <StyledDepositTx onClose={onClose} header="Invest" {...props}>
      <TxTokenInput
        headerText="From wallet"
        inputText={`Balance ${formatAmount(balance, 4)} ${selectedSellToken.symbol}`}
        amount={amount}
        onAmountChange={setAmount}
        amountValue={amountValue}
        maxAmount={balance}
        selectedToken={selectedSellToken}
        onSelectedTokenChange={onSelectedSellTokenChange}
        tokenOptions={allowVaultSelect ? undefined : sellTokensOptions}
      />

      {!error && <TxArrowStatus status={txStatus} />}
      {error && <TxError errorText={error} />}

      <TxTokenInput
        headerText="To vault"
        inputText={`Balance ${formatAmount(vaultBalance, 4)} ${selectedVault.token.symbol}`}
        amount={expectedAmount}
        amountValue={expectedAmountValue}
        selectedToken={selectedVault.token}
        onSelectedTokenChange={onSelectedVaultChange}
        // TODO Make this logic outside html
        tokenOptions={
          allowVaultSelect ? vaultsOptions : vaultsOptions.filter(({ address }) => selectedVault.address === address)
        }
        yieldPercent={formatPercent(selectedVault.apyData, 2)}
        readOnly
      />

      <TxActions>
        <TxActionButton onClick={() => approve()} disabled={isApproved} pending={actionsStatus.approve.loading}>
          Approve
        </TxActionButton>

        <TxActionButton
          onClick={() => deposit()}
          disabled={!isApproved || !isValidAmount}
          pending={actionsStatus.deposit.loading}
        >
          Deposit
        </TxActionButton>
      </TxActions>
    </StyledDepositTx>
  );
};
