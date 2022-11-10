import { FC, useState, useEffect } from 'react';
import styled from 'styled-components';
import { ethers } from 'ethers';

import { formatAmount, normalizeAmount } from '@utils';
import { useAppTranslation, useAppDispatch, useAppSelector, useSelectedSellToken } from '@hooks';
import { TokensActions, TokensSelectors, VaultsSelectors, LinesSelectors, LinesActions, WalletSelectors } from '@store';
import { getConstants } from '@src/config/constants';
import { PositionItem } from '@src/core/types';

import { TxContainer } from './components/TxContainer';
import { TxTokenInput } from './components/TxTokenInput';
import { TxActionButton } from './components/TxActions';
import { TxActions } from './components/TxActions';
import { TxStatus } from './components/TxStatus';
import { TxRateInput } from './components/TxRateInput';
import { TxDropdown } from './components/TxDropdown';
import { TxPositionInput } from './components/TxPositionInput';

const StyledTransaction = styled(TxContainer)``;

interface DepositAndRepayProps {
  header: string;
  onClose: () => void;
  acceptingOffer: boolean;
  onSelectedCreditLineChange: Function;
  onPositionChange: (data: { credit?: string; token: string | undefined; amount?: string }) => void;
}

const {
  CONTRACT_ADDRESSES: { DAI },
} = getConstants();

export const DepositAndRepayTx: FC<DepositAndRepayProps> = (props) => {
  const { t } = useAppTranslation('common');
  const dispatch = useAppDispatch();
  const { acceptingOffer, header, onClose, onPositionChange } = props;
  const [repayType, setRepayType] = useState({ id: '1', label: 'wallet', value: 'wallet' });
  const selectedPosition = useAppSelector(LinesSelectors.selectPositionData);
  const [transactionCompleted, setTransactionCompleted] = useState(0);
  const [transactionLoading, setLoading] = useState(false);
  const [targetAmount, setTargetAmount] = useState('1');
  const selectedCredit = useAppSelector(LinesSelectors.selectSelectedLine);
  const [selectedTokenAddress, setSelectedTokenAddress] = useState('');
  const walletNetwork = useAppSelector(WalletSelectors.selectWalletNetwork);
  const setSelectedCredit = (lineAddress: string) => dispatch(LinesActions.setSelectedLineAddress({ lineAddress }));
  const selectedSellTokenAddress = useAppSelector(TokensSelectors.selectSelectedTokenAddress);
  const initialToken: string = selectedSellTokenAddress || DAI;
  const positions = useAppSelector(LinesSelectors.selectPositions);

  const repaymentOptions = [
    { id: '1', label: 'Repay from:', value: 'Wallet' },
    { id: '2', label: 'Repay from:', value: 'Claim' },
    { id: '3', label: 'Repay from:', value: 'Deposit' },
  ];

  const { selectedSellToken, sourceAssetOptions } = useSelectedSellToken({
    selectedSellTokenAddress: initialToken,
    selectedVaultOrLab: useAppSelector(VaultsSelectors.selectRecommendations)[0],
    allowTokenSelect: true,
  });

  useEffect(() => {
    console.log('repay type', repayType);
  }, [repayType]);

  useEffect(() => {
    if (!selectedSellToken) {
      dispatch(
        TokensActions.setSelectedTokenAddress({
          tokenAddress: sourceAssetOptions[0].address,
        })
      );
    }
    if (selectedTokenAddress === '' && selectedSellToken) {
      setSelectedTokenAddress(selectedSellToken.address);
    }

    if (
      !selectedCredit ||
      !selectedSellToken
      // toBN(targetTokenAmount).lte(0) ||
      // inputError ||
    ) {
      return;
    }

    dispatch(TokensActions.getTokensDynamicData({ addresses: [initialToken] })); // pulled from DepositTX, not sure why data not already filled
    // dispatch(CreditLineActions.getCreditLinesDynamicData({ addresses: [initialToken] })); // pulled from DepositTX, not sure why data not already filled
  }, [selectedSellToken]);

  const _updatePosition = () =>
    onPositionChange({
      credit: selectedCredit?.id,
      token: selectedSellToken?.address,
      amount: targetAmount,
    });

  // Event Handlers

  const onAmountChange = (amount: string): void => {
    setTargetAmount(amount);
    _updatePosition();
  };

  const onTransactionCompletedDismissed = () => {
    if (onClose) {
      onClose();
    } else {
      setTransactionCompleted(0);
    }
  };

  const depositAndRepay = () => {
    setLoading(true);
    // TODO set error in state to display no line selected
    if (!selectedCredit?.id || !targetAmount || !selectedSellTokenAddress || walletNetwork === undefined) {
      setLoading(false);
      return;
    }

    dispatch(
      LinesActions.depositAndRepay({
        lineAddress: selectedCredit.id,
        tokenAddress: selectedSellTokenAddress,
        amount: ethers.utils.parseEther(targetAmount),
        network: walletNetwork,
      })
    ).then((res) => {
      if (res.meta.requestStatus === 'rejected') {
        setTransactionCompleted(2);
        setLoading(false);
      }
      if (res.meta.requestStatus === 'fulfilled') {
        setTransactionCompleted(1);
        setLoading(false);
      }
    });
  };

  const depositAndClose = () => {
    setLoading(true);
    // TODO set error in state to display no line selected
    if (!selectedCredit?.id || selectedPosition === undefined || walletNetwork === undefined) {
      setLoading(false);
      return;
    }

    dispatch(
      LinesActions.depositAndClose({
        lineAddress: selectedCredit.id,
        //@ts-ignore
        id: selectedPosition[0]['id'],
        network: walletNetwork,
      })
    ).then((res) => {
      if (res.meta.requestStatus === 'rejected') {
        setTransactionCompleted(2);
        setLoading(false);
      }
      if (res.meta.requestStatus === 'fulfilled') {
        setTransactionCompleted(1);
        setLoading(false);
      }
    });
  };

  const claimAndRepay = () => {
    setLoading(true);
    // TODO set error in state to display no line selected
    if (!selectedCredit?.id || !targetAmount || !selectedSellTokenAddress || walletNetwork === undefined) {
      setLoading(false);
      return;
    }

    dispatch(
      LinesActions.claimAndRepay({
        lineAddress: selectedCredit.id,
        claimToken: selectedSellTokenAddress,
        calldata: '',
        network: walletNetwork,
      })
    ).then((res) => {
      if (res.meta.requestStatus === 'rejected') {
        setTransactionCompleted(2);
        setLoading(false);
      }
      if (res.meta.requestStatus === 'fulfilled') {
        setTransactionCompleted(1);
        setLoading(false);
      }
    });
  };

  const txActions = [
    {
      label:
        repayType.value === 'Wallet'
          ? t('components.transaction.deposit-and-repay-header')
          : repayType.value === 'Claim'
          ? t('components.transaction.claim-and-repay-header')
          : repayType.value === 'Deposit'
          ? t('components.transaction.deposit-and-close-header')
          : 'Repay',
      onAction:
        repayType.value === 'Wallet'
          ? depositAndRepay
          : repayType.value === 'Claim'
          ? claimAndRepay
          : repayType.value === 'Deposit'
          ? depositAndClose
          : () => {},
      status: true,
      disabled: false,
      contrast: false,
    },
  ];

  const onSelectedCreditLineChange = (addr: string): void => {
    setSelectedCredit(addr);
    _updatePosition();
  };

  const onSelectedTypeChange = (newRepayType: { id: string; label: string; value: string }): void => {
    setRepayType(newRepayType);
    _updatePosition();
  };

  const onSelectedPositionChange = (arg: PositionItem): void => {
    dispatch(LinesActions.setSelectedLinePosition({ position: arg.id }));
  };

  if (!selectedCredit || selectedPosition === undefined) return null;
  if (!selectedSellToken) return null;

  const onSelectedSellTokenChange = (tokenAddress: string) => {
    dispatch(TokensActions.setSelectedTokenAddress({ tokenAddress }));
  };

  const targetBalance = normalizeAmount(selectedSellToken.balance, selectedSellToken.decimals);
  const tokenHeaderText = `${t('components.transaction.token-input.you-have')} ${formatAmount(targetBalance, 4)} ${
    selectedSellToken.symbol
  }`;

  if (transactionCompleted === 1) {
    return (
      <StyledTransaction onClose={onClose} header={'transaction'}>
        <TxStatus
          success={transactionCompleted}
          transactionCompletedLabel={'completed'}
          exit={onTransactionCompletedDismissed}
        />
      </StyledTransaction>
    );
  }

  if (transactionCompleted === 2) {
    return (
      <StyledTransaction onClose={onClose} header={'transaction'}>
        <TxStatus
          success={transactionCompleted}
          transactionCompletedLabel={'could not deposit and repay'}
          exit={onTransactionCompletedDismissed}
        />
      </StyledTransaction>
    );
  }

  return (
    <StyledTransaction onClose={onClose} header={header || t('components.transaction.deposit-and-repay.header')}>
      <TxPositionInput
        key={'credit-input'}
        headerText={t('components.transaction.borrow-credit.select-line')}
        inputText={t('components.transaction.borrow-credit.select-line')}
        onSelectedPositionChange={onSelectedPositionChange}
        //@ts-ignore
        selectedPosition={selectedPosition[0]}
        positions={positions}
        // creditOptions={sourceCreditOptions}
        // inputError={!!sourceStatus.error}
        readOnly={false}
        // displayGuidance={displaySourceGuidance}
      />
      <TxDropdown
        key={'type-input'}
        headerText={t('components.transaction.deposit-and-repay.repay-type')}
        inputText={t('components.transaction.deposit-and-repay.select-repay')}
        onSelectedTypeChange={onSelectedTypeChange}
        selectedType={repayType}
        typeOptions={repaymentOptions}
        // creditOptions={sourceCreditOptions}
        // inputError={!!sourceStatus.error}
        readOnly={false}
      />
      <TxTokenInput
        key={'token-input'}
        headerText={t('components.transaction.deposit-and-repay.select-amount')}
        inputText={tokenHeaderText}
        amount={targetAmount}
        onAmountChange={onAmountChange}
        amountValue={String(10000000 * Number(targetAmount))}
        maxAmount={targetBalance}
        selectedToken={selectedSellToken}
        onSelectedTokenChange={onSelectedSellTokenChange}
        tokenOptions={sourceAssetOptions}
        // inputError={!!sourceStatus.error}
        readOnly={acceptingOffer}
        // displayGuidance={displaySourceGuidance}
      />
      <TxRateInput
        key={'frate'}
        headerText={t('components.transaction.deposit-and-repay.your-rates')}
        frate={selectedPosition['frate']}
        drate={selectedPosition['drate']}
        amount={selectedPosition['frate']}
        maxAmount={'100'}
        // setRateChange={onFrateChange}
        setRateChange={() => {}}
        readOnly={true}
      />
      <TxActions>
        {txActions.map(({ label, onAction, status, disabled, contrast }) => (
          <TxActionButton
            key={label}
            data-testid={`modal-action-${label.toLowerCase()}`}
            onClick={onAction}
            disabled={disabled}
            contrast={contrast}
            isLoading={transactionLoading}
          >
            {label}
          </TxActionButton>
        ))}
      </TxActions>
    </StyledTransaction>
  );
};
