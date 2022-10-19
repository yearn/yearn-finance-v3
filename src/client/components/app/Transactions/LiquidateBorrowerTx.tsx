import { FC, useState, useEffect } from 'react';
import styled from 'styled-components';
import { ethers } from 'ethers';

import { formatAmount, normalizeAmount } from '@utils';
import {
  useAppTranslation,
  useAppDispatch,

  // used to dummy token for dev
  useAppSelector,
  useSelectedSellToken,
} from '@hooks';
import { getConstants } from '@src/config/constants';
import { TokensActions, TokensSelectors, VaultsSelectors, LinesSelectors, LinesActions } from '@store';

import { TxContainer } from './components/TxContainer';
import { TxTokenInput } from './components/TxTokenInput';
import { TxCreditLineInput } from './components/TxCreditLineInput';
import { TxActionButton, TxActions } from './components/TxActions';
import { TxStatus } from './components/TxStatus';

const {
  CONTRACT_ADDRESSES: { DAI },
} = getConstants();
const StyledTransaction = styled(TxContainer)``;

interface LiquidateBorrowerProps {
  header: string;
  onClose: () => void;
  onSelectedCreditLineChange: Function;
  allowVaultSelect: boolean;
  onPositionChange: (data: { credit?: string; token?: string; amount?: string }) => void;
}

export const LiquidateBorrowerTx: FC<LiquidateBorrowerProps> = (props) => {
  const { t } = useAppTranslation('common');
  const dispatch = useAppDispatch();
  const { header, onClose, onPositionChange } = props;

  const [targetTokenAmount, setTargetTokenAmount] = useState('10000000');
  const selectedCredit = useAppSelector(LinesSelectors.selectSelectedLine);
  const [transactionLoading, setLoading] = useState(false);
  const [selectedTokenAddress, setSelectedTokenAddress] = useState('');
  const [transactionCompleted, setTransactionCompleted] = useState(0);
  const selectedSellTokenAddress = useAppSelector(TokensSelectors.selectSelectedTokenAddress);
  const initialToken: string = selectedSellTokenAddress || DAI;

  const { selectedSellToken, sourceAssetOptions } = useSelectedSellToken({
    selectedSellTokenAddress: initialToken,
    selectedVaultOrLab: useAppSelector(VaultsSelectors.selectRecommendations)[0],
    allowTokenSelect: true,
  });

  useEffect(() => {
    console.log('add position tx useEffect token/creditLine', selectedSellTokenAddress, initialToken, selectedCredit);
    if (selectedTokenAddress === '' && selectedSellToken) {
      setSelectedTokenAddress(selectedSellToken.address);
    }
    if (!selectedSellToken) {
      dispatch(
        TokensActions.setSelectedTokenAddress({
          tokenAddress: sourceAssetOptions[0].address,
        })
      );
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
  }, [selectedSellToken, selectedCredit]);

  const _updatePosition = () =>
    onPositionChange({
      credit: selectedCredit?.id,
      token: selectedSellToken?.address,
      amount: targetTokenAmount,
    });

  const onSelectedSellTokenChange = (tokenAddress: string) => {
    setTargetTokenAmount('');
    dispatch(TokensActions.setSelectedTokenAddress({ tokenAddress }));
  };

  // Event Handlers

  const onAmountChange = (amount: string): void => {
    setTargetTokenAmount(amount);
    _updatePosition();
  };

  const onSelectedCreditLineChange = (addr: string): void => {
    console.log('select new loc', addr);
    _updatePosition();
  };

  const onTransactionCompletedDismissed = () => {
    if (onClose) {
      onClose();
    } else {
      setTransactionCompleted(0);
    }
  };

  const liquidateBorrower = () => {
    setLoading(true);
    // TODO set error in state to display no line selected
    if (!selectedCredit?.id || selectedSellTokenAddress === '' || selectedSellTokenAddress === undefined) {
      console.log('check this', selectedCredit?.id, selectedSellTokenAddress);
      setLoading(false);
      return;
    }

    let TransactionObj = {
      lineAddress: selectedCredit.id,
      amount: ethers.utils.parseEther(targetTokenAmount),
      tokenAddress: selectedSellTokenAddress,
    };
    dispatch(LinesActions.liquidate(TransactionObj)).then((res) => {
      if (res.meta.requestStatus === 'rejected') {
        setTransactionCompleted(2);
        console.log(transactionCompleted, 'tester');
        setLoading(false);
      }
      if (res.meta.requestStatus === 'fulfilled') {
        setTransactionCompleted(1);
        console.log(transactionCompleted, 'tester');
        setLoading(false);
      }
    });
    //dispatch(LinesActions.addCredit(TransactionObj)).then((res) => {
    //  if (res.meta.requestStatus === 'rejected') {
    //    setTransactionCompleted(2);
    //    console.log(transactionCompleted, 'tester');
    //    setLoading(false);
    //  }
    //  if (res.meta.requestStatus === 'fulfilled') {
    //    setTransactionCompleted(1);
    //    console.log(transactionCompleted, 'tester');
    //    setLoading(false);
    //  }
    //});
  };

  const txActions = [
    {
      label: t('components.transaction.liquidate'),
      onAction: liquidateBorrower,
      status: true,
      disabled: transactionCompleted,
      contrast: true,
    },
  ];

  console.log(selectedCredit, selectedCredit, 'here is breaking point');
  if (!selectedSellToken) return null;
  if (!selectedCredit) return null;

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
          transactionCompletedLabel={'could not add credit'}
          exit={onTransactionCompletedDismissed}
        />
      </StyledTransaction>
    );
  }

  return (
    <StyledTransaction onClose={onClose} header={header || t('components.transaction.title')}>
      <TxCreditLineInput
        key={'credit-input'}
        headerText={t('components.transaction.arbiter-liquidate.select-credit')}
        inputText={t('components.transaction.arbiter-liquidate.select-credit')}
        onSelectedCreditLineChange={onSelectedCreditLineChange}
        selectedCredit={selectedCredit}
        // creditOptions={sourceCreditOptions}
        // inputError={!!sourceStatus.error}
        readOnly={false}
        // displayGuidance={displaySourceGuidance}
      />
      <TxTokenInput
        key={'token-input'}
        headerText={t('components.transaction.arbiter-liquidate.select-token')}
        inputText={tokenHeaderText}
        amount={targetTokenAmount}
        onAmountChange={onAmountChange}
        amountValue={String(10000000 * Number(targetTokenAmount))}
        maxAmount={targetBalance}
        selectedToken={selectedSellToken}
        onSelectedTokenChange={onSelectedSellTokenChange}
        tokenOptions={sourceAssetOptions}
      />
      <TxActions>
        {txActions.map(({ label, onAction, status, disabled, contrast }) => (
          <TxActionButton
            key={label}
            data-testid={`modal-action-${label.toLowerCase()}`}
            onClick={onAction}
            disabled={false}
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
