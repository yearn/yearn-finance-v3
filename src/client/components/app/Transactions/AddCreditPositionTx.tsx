import React, { FC, useState, useEffect } from 'react';
import styled from 'styled-components';
import { TokenCard } from '@yearn-finance/web-lib';
import { ethers } from 'ethers';

import { formatAmount, normalizeAmount, toBN } from '@utils';
import {
  useAppTranslation,
  useAppDispatch,
  useSelectedCreditLine,

  // used to dummy token for dev
  useAppSelector,
  useSelectedSellToken,
} from '@hooks';
import { getConstants } from '@src/config/constants';
import { Address, Token, Asset, TokenView, AggregatedCreditLine } from '@src/core/types';
import { TokensActions, TokensSelectors, VaultsSelectors, VaultsActions, LinesSelectors, LinesActions } from '@store';

import { TxContainer } from './components/TxContainer';
import { TxTokenInput } from './components/TxTokenInput';
import { TxCreditLineInput } from './components/TxCreditLineInput';
import { TxRateInput } from './components/TxRateInput';
import { TxActionButton } from './components/TxActions';
import { TxActions } from './components/TxActions';
import { TxStatus } from './components/TxStatus';

const {
  CONTRACT_ADDRESSES: { DAI },
  MAX_INTEREST_RATE,
} = getConstants();
const StyledTransaction = styled(TxContainer)``;

interface AddCreditPositionProps {
  header: string;
  onClose: () => void;
  acceptingOffer: boolean;
  onSelectedCreditLineChange: Function;
  allowVaultSelect: boolean;
  onPositionChange: (data: {
    credit?: string;
    token?: string;
    amount?: string;
    drate?: string;
    frate?: string;
  }) => void;
}

const RatesContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

export const AddCreditPositionTx: FC<AddCreditPositionProps> = (props) => {
  const { t } = useAppTranslation('common');
  const dispatch = useAppDispatch();
  const { allowVaultSelect, acceptingOffer, header, onClose, onPositionChange } = props;
  const [transactionCompleted, setTransactionCompleted] = useState(0);
  const [transactionApproved, setTransactionApproved] = useState(true);
  const [transactionLoading, setLoading] = useState(false);
  const [targetTokenAmount, setTargetTokenAmount] = useState('1');

  const [drate, setDrate] = useState('0.00');
  const [frate, setFrate] = useState('0.00');

  const selectedCredit = useAppSelector(LinesSelectors.selectSelectedLine);
  const setSelectedCredit = (lineAddress: string) => dispatch(LinesActions.setSelectedLineAddress({ lineAddress }));
  if (!selectedCredit) setSelectedCredit('0xb71de8f02215fb0128cc31db0bb738c87ebec5f9');

  const selectedSellTokenAddress = useAppSelector(TokensSelectors.selectSelectedTokenAddress);
  const initialToken: string = selectedSellTokenAddress || DAI;
  const { selectedSellToken, sourceAssetOptions } = useSelectedSellToken({
    selectedSellTokenAddress: initialToken,
    selectedVaultOrLab: useAppSelector(VaultsSelectors.selectRecommendations)[0],
    allowTokenSelect: true,
  });

  useEffect(() => {
    console.log('add position tx useEffect token/creditLine', selectedSellTokenAddress, initialToken, selectedCredit);
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
      drate: drate,
      frate: frate,
    });

  // Event Handlers

  const onAmountChange = (amount: string): void => {
    setTargetTokenAmount(amount);
    _updatePosition();
  };

  const onRateChange = (type: string, amount: string): void => {
    if (type === 'd') setDrate(amount);
    if (type === 'f') setFrate(amount);

    _updatePosition();
  };

  const onSelectedCreditLineChange = (addr: string): void => {
    console.log('select new loc', addr);
    setSelectedCredit(addr);
    _updatePosition();
  };

  const onSelectedSellTokenChange = (tokenAddress: string) => {
    setTargetTokenAmount('');
    onRateChange('f', '0.00');
    onRateChange('d', '0.00');
    dispatch(TokensActions.setSelectedTokenAddress({ tokenAddress }));
  };

  const approveCreditPosition = () => {
    console.log('example ', selectedSellTokenAddress, targetTokenAmount, drate, frate);
    setLoading(true);
    if (selectedSellTokenAddress === undefined) {
      return;
    }
    dispatch(
      //@ts-ignore
      LinesActions.approveDeposit({
        tokenAddress: selectedSellTokenAddress,
        amount: `${ethers.utils.parseEther(targetTokenAmount)}`,
      })
    );
    setLoading(false);
    setTransactionApproved(!transactionApproved);
  };

  const onTransactionCompletedDismissed = () => {
    if (onClose) {
      onClose();
    } else {
      setTransactionCompleted(0);
    }
  };

  const addCreditPosition = () => {
    setLoading(true);
    // TODO set error in state to display no line selected
    if (!selectedCredit) return;

    let bigNumDRate = toBN(drate);
    let bigNumFRate = toBN(frate);

    console.log(bigNumDRate, bigNumFRate);

    if (!selectedSellTokenAddress) {
      console.log('error');
      return;
    }

    dispatch(
      LinesActions.addCredit({
        lineAddress: selectedCredit.id,
        drate: ethers.utils.parseEther(drate),
        frate: ethers.utils.parseEther(frate),
        amount: ethers.utils.parseEther(targetTokenAmount),
        token: selectedSellTokenAddress,
        lender: '',
        dryRun: true,
      })
    ).then((res) => {
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
  };

  const txActions = [
    {
      label: t('components.transaction.approve'),
      onAction: approveCreditPosition,
      status: true,
      disabled: !transactionApproved,
      contrast: false,
    },
    {
      label: t('components.transaction.deposit'),
      onAction: addCreditPosition,
      status: true,
      disabled: transactionApproved,
      contrast: true,
    },
  ];

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
        headerText={t('components.transaction.add-credit.select-credit')}
        inputText={t('components.transaction.add-credit.select-credit')}
        onSelectedCreditLineChange={onSelectedCreditLineChange}
        selectedCredit={selectedCredit}
        // creditOptions={sourceCreditOptions}
        // inputError={!!sourceStatus.error}
        readOnly={false}
        // displayGuidance={displaySourceGuidance}
      />
      <TxTokenInput
        key={'token-input'}
        headerText={t('components.transaction.add-credit.select-token')}
        inputText={tokenHeaderText}
        amount={targetTokenAmount}
        onAmountChange={onAmountChange}
        amountValue={String(10000000 * Number(targetTokenAmount))}
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
        headerText={t('components.transaction.add-credit.select-rates')}
        frate={frate}
        drate={drate}
        amount={frate}
        maxAmount={MAX_INTEREST_RATE.toString()}
        // setRateChange={onFrateChange}
        setRateChange={onRateChange}
        readOnly={acceptingOffer}
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
