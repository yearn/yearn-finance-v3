import { FC, useState, useEffect } from 'react';
import styled from 'styled-components';

import { useAppSelector, useAppDispatch } from '@hooks';
import { VaultsSelectors, TokensActions, LabsSelectors, LabsActions } from '@store';

import { TxActionButton, TxActions } from '../components/TxActions';
import { TxContainer } from '../components/TxContainer';
import { TxTokenInput } from '../components/TxTokenInput';
import { TxError } from '../components/TxError';
import { TxStatus } from '../components/TxStatus';
import { TxArrowStatus, TxArrowStatusTypes } from '../components/TxArrowStatus';

import {
  toBN,
  formatPercent,
  formatAmount,
  normalizeAmount,
  USDC_DECIMALS,
  validateVaultDeposit,
  validateVaultAllowance,
} from '@src/utils';

export interface BackscratcherLockTxProps {
  onClose?: () => void;
}

const StyledBackscratcherLockTx = styled(TxContainer)``;

export const BackscratcherLockTx: FC<BackscratcherLockTxProps> = ({ onClose, children, ...props }) => {
  const dispatch = useAppDispatch();
  const [amount, setAmount] = useState('');
  const [txCompleted, setTxCompleted] = useState(false);
  const selectedLab = useAppSelector(LabsSelectors.selectYveCrvLab);
  const actionsStatus = useAppSelector(VaultsSelectors.selectSelectedVaultActionsStatusMap); // TODO: REPLACE WITH LAB SELECTOR
  const selectedSellTokenAddress = selectedLab?.token.address;
  const selectedSellToken = selectedLab?.token;

  useEffect(() => {
    if (!selectedLab || !selectedSellTokenAddress) return;

    dispatch(
      TokensActions.getTokenAllowance({
        tokenAddress: selectedSellTokenAddress,
        spenderAddress: selectedLab.address,
      })
    );
  }, [selectedSellTokenAddress]);

  if (!selectedLab || !selectedSellTokenAddress || !selectedSellToken) {
    return null;
  }

  // TODO: REPLACE WITH LAB VALIDATIONS
  const { approved: isApproved, error: allowanceError } = validateVaultAllowance({
    amount: toBN(amount),
    vaultAddress: selectedLab.address,
    vaultUnderlyingTokenAddress: selectedLab.token.address,
    sellTokenAddress: selectedSellTokenAddress,
    sellTokenDecimals: selectedSellToken.decimals.toString(),
    sellTokenAllowancesMap: selectedSellToken.allowancesMap,
  });

  const { approved: isValidAmount, error: inputError } = validateVaultDeposit({
    sellTokenAmount: toBN(amount),
    depositLimit: '0',
    emergencyShutdown: false,
    sellTokenDecimals: selectedSellToken.decimals.toString(),
    userTokenBalance: selectedSellToken.balance,
    vaultUnderlyingBalance: selectedLab.labBalance,
  });

  // TODO: NEED A CLEAR ERROR ACTION ON MODAL UNMOUNT
  const error = allowanceError || inputError || actionsStatus.approve.error || actionsStatus.deposit.error;

  const balance = normalizeAmount(selectedSellToken.balance, selectedSellToken.decimals);
  const LabBalance = normalizeAmount(selectedLab.DEPOSIT.userDeposited, selectedLab.token.decimals);
  const amountValue = toBN(amount).times(normalizeAmount(selectedSellToken.priceUsdc, USDC_DECIMALS)).toString();
  const expectedAmount = amount;
  const expectedAmountValue = amountValue;

  const approve = () =>
    dispatch(
      LabsActions.yveCrv.yveCrvApproveDeposit({
        labAddress: selectedLab.address,
        tokenAddress: selectedSellToken.address,
      })
    );

  const lock = () => {
    try {
      dispatch(
        LabsActions.yveCrv.yveCrvDeposit({
          labAddress: selectedLab.address,
          sellTokenAddress: selectedSellToken.address,
          amount: toBN(amount),
        })
      );
      setTxCompleted(true);
    } catch (error) {
      console.log(error);
    }
  };

  const txStatus: TxArrowStatusTypes = 'preparing';

  if (txCompleted) {
    return (
      <StyledBackscratcherLockTx onClose={onClose} header="Lock" {...props}>
        <TxStatus exit={() => setTxCompleted(false)} />
      </StyledBackscratcherLockTx>
    );
  }

  return (
    <StyledBackscratcherLockTx onClose={onClose} header="Lock" {...props}>
      <TxTokenInput
        headerText="From wallet"
        inputText={`Balance ${formatAmount(balance, 4)} ${selectedSellToken.symbol}`}
        amount={amount}
        onAmountChange={setAmount}
        amountValue={amountValue}
        maxAmount={balance}
        selectedToken={selectedSellToken}
        inputError={!!error?.length}
      />

      {!error && <TxArrowStatus status={txStatus} />}
      {error && <TxError errorText={error} />}

      <TxTokenInput
        headerText="To vault"
        inputText={`Balance ${formatAmount(LabBalance, 4)} ${selectedLab.token.symbol}`}
        amount={expectedAmount}
        amountValue={expectedAmountValue}
        selectedToken={{ ...selectedLab.token, icon: selectedLab.icon }}
        yieldPercent={formatPercent(selectedLab.apyData, 2)}
        readOnly
      />
      <TxActions>
        <TxActionButton onClick={() => approve()} disabled={isApproved} pending={actionsStatus.approve.loading}>
          Approve
        </TxActionButton>

        <TxActionButton
          onClick={() => lock()}
          disabled={!isApproved || !isValidAmount}
          pending={actionsStatus.deposit.loading}
        >
          Lock
        </TxActionButton>
      </TxActions>
    </StyledBackscratcherLockTx>
  );
};
