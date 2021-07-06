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
  USDC_DECIMALS,
  validateVaultWithdraw,
  validateVaultWithdrawAllowance,
  calculateSharesAmount,
} from '@src/utils';
import { getConfig } from '@config';

export interface WithdrawTxProps {
  onClose?: () => void;
}

const StyledWithdrawTx = styled(TxContainer)``;

export const WithdrawTx: FC<WithdrawTxProps> = ({ onClose, children, ...props }) => {
  const { SLIPPAGE_OPTIONS, CONTRACT_ADDRESSES } = getConfig();
  const slippageOptions = SLIPPAGE_OPTIONS.map((value) => ({
    value: value.toString(),
    label: formatPercent(value.toString(), 0),
  }));
  const dispatch = useAppDispatch();
  const [amount, setAmount] = useState('');
  const selectedVault = useAppSelector(VaultsSelectors.selectSelectedVault);
  const zapOutTokens = useAppSelector(TokensSelectors.selectZapOutTokens);
  const [selectedTargetTokenAddress, setSelectedTargetTokenAddress] = useState(selectedVault?.token.address ?? '');
  const [selectedSlippage, setSelectedSlippage] = useState(slippageOptions[0]);
  const targetTokensOptions = selectedVault
    ? [selectedVault.token, ...zapOutTokens.filter(({ address }) => address !== selectedVault.token.address)]
    : zapOutTokens;
  const targetTokensOptionsMap = keyBy(targetTokensOptions, 'address');
  const selectedTargetToken = targetTokensOptionsMap[selectedTargetTokenAddress];
  const expectedTxOutcome = useAppSelector(VaultsSelectors.selectExpectedTxOutcome);
  const expectedTxOutcomeStatus = useAppSelector(VaultsSelectors.selectExpectedTxOutcomeStatus);
  const actionsStatus = useAppSelector(VaultsSelectors.selectSelectedVaultActionsStatusMap);

  const yvTokenAmount = calculateSharesAmount({
    amount: toBN(amount),
    decimals: selectedVault!.decimals,
    pricePerShare: selectedVault!.pricePerShare,
  });
  const yvTokenAmountNormalized = normalizeAmount(yvTokenAmount, toBN(selectedVault?.decimals).toNumber());

  useEffect(() => {
    return () => {
      // TODO: CREATE A CLEAR SELECTED VAULT/TOKEN ADDRESS ACTION
      dispatch(VaultsActions.setSelectedVaultAddress({ vaultAddress: undefined }));
      dispatch(TokensActions.setSelectedTokenAddress({ tokenAddress: undefined }));
    };
  }, []);

  useEffect(() => {
    if (!selectedVault) return;

    dispatch(
      TokensActions.getTokenAllowance({
        tokenAddress: selectedVault.address,
        spenderAddress: CONTRACT_ADDRESSES.zapOut,
      })
    );
  }, [selectedTargetTokenAddress]);

  useEffect(() => {
    if (!selectedVault || !selectedTargetTokenAddress) return;

    if (toBN(amount).gt(0)) {
      dispatch(
        VaultsActions.getExpectedTransactionOutcome({
          transactionType: 'WITHDRAW',
          sourceTokenAddress: selectedVault.address,
          sourceTokenAmount: yvTokenAmount,
          targetTokenAddress: selectedTargetTokenAddress,
        })
      );
    }
  }, [amount, selectedTargetTokenAddress, selectedVault]);

  if (!selectedVault || !selectedTargetToken || !targetTokensOptions) {
    return null;
  }

  const { approved: isApproved, error: allowanceError } = validateVaultWithdrawAllowance({
    yvTokenAddress: selectedVault.address,
    yvTokenAmount: toBN(yvTokenAmountNormalized),
    yvTokenDecimals: selectedVault.decimals,
    underlyingTokenAddress: selectedVault.token.address,
    targetTokenAddress: selectedTargetTokenAddress,
    yvTokenAllowancesMap: selectedVault.allowancesMap,
  });

  const { approved: isValidAmount, error: inputError } = validateVaultWithdraw({
    yvTokenAmount: toBN(yvTokenAmountNormalized),
    yvTokenDecimals: selectedVault.decimals,
    userYvTokenBalance: selectedVault.DEPOSIT.userBalance,
  });

  // TODO: NEED A CLEAR ERROR ACTION ON MODAL UNMOUNT
  const error = allowanceError || inputError || actionsStatus.approveZapOut.error || actionsStatus.withdraw.error;

  const balance = normalizeAmount(selectedTargetToken.balance, selectedVault.token.decimals);
  const vaultBalance = normalizeAmount(selectedVault.DEPOSIT.userDeposited, selectedVault.token.decimals);
  const amountValue = toBN(amount).times(normalizeAmount(selectedVault.token.priceUsdc, USDC_DECIMALS)).toString();
  const expectedAmount = toBN(amount).gt(0)
    ? normalizeAmount(expectedTxOutcome?.targetUnderlyingTokenAmount, selectedVault?.token.decimals)
    : '';
  const expectedAmountValue = toBN(expectedAmount)
    .times(normalizeAmount(selectedVault.token.priceUsdc, USDC_DECIMALS))
    .toString();

  const approve = () => dispatch(VaultsActions.approveZapOut({ vaultAddress: selectedVault.address }));

  const withdraw = () =>
    dispatch(
      VaultsActions.withdrawVault({
        vaultAddress: selectedVault.address,
        amount: toBN(amount),
        targetTokenAddress: selectedTargetTokenAddress,
        slippageTolerance: toBN(selectedSlippage.value).toNumber(),
      })
    );

  const onSelectedTargetTokenChange = (tokenAddress: string) => {
    setAmount('');
    setSelectedTargetTokenAddress(tokenAddress);
  };

  const txStatus: TxArrowStatusTypes = 'preparing';

  return (
    <StyledWithdrawTx onClose={onClose} header="Withdraw" {...props}>
      <TxTokenInput
        headerText="From vault"
        inputText={`Balance ${formatAmount(vaultBalance, 4)} ${selectedVault.token.symbol}`}
        amount={amount}
        onAmountChange={setAmount}
        amountValue={amountValue}
        maxAmount={vaultBalance}
        selectedToken={selectedVault.token}
        tokenOptions={[
          {
            address: selectedVault.address,
            symbol: selectedVault.name,
            icon: selectedVault.token.icon,
            balance: selectedVault.DEPOSIT.userDeposited,
            decimals: selectedVault.token.decimals,
          },
        ]}
        inputError={!!error?.length}
      />

      {!error && <TxArrowStatus status={txStatus} />}
      {error && <TxError errorText={error} />}

      <TxTokenInput
        headerText="To wallet"
        inputText={`Balance ${formatAmount(balance, 4)} ${selectedTargetToken.symbol}`}
        amount={expectedAmount}
        amountValue={expectedAmountValue}
        selectedToken={selectedTargetToken}
        onSelectedTokenChange={onSelectedTargetTokenChange}
        tokenOptions={targetTokensOptions}
        readOnly
      />

      <TxActions>
        <TxActionButton onClick={() => approve()} disabled={isApproved} pending={actionsStatus.approveZapOut.loading}>
          Approve
        </TxActionButton>

        <TxActionButton
          onClick={() => withdraw()}
          disabled={!isApproved || !isValidAmount}
          pending={actionsStatus.withdraw.loading}
        >
          Withdraw
        </TxActionButton>
      </TxActions>
    </StyledWithdrawTx>
  );
};
