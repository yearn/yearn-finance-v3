import React, { FC, useState, useEffect } from 'react';
import styled from 'styled-components';
import { TokenCard } from '@yearn-finance/web-lib';

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
import { Address, Token, Asset } from '@src/core/types';
import { TokensActions, TokensSelectors, VaultsSelectors, VaultsActions } from '@store';

import { TxContainer } from './components/TxContainer';
import { TxTokenInput } from './components/TxTokenInput';
import { TxCreditInput } from './components/TxCreditInput';
import { TxRateInput } from './components/TxRateInput';

const {
  CONTRACT_ADDRESSES: { DAI },
  MAX_INTEREST_RATE,
} = getConstants();
const StyledTransaction = styled(TxContainer)``;

interface AddCreditPositionProps {
  header: string;
  onClose: () => void;
  acceptingOffer: boolean;
  onCreditLineChange: Function;
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
  console.log('add position tx', dispatch, props);
  const { allowVaultSelect, acceptingOffer, header, onClose, onPositionChange } = props;
  const [targetTokenAmount, setTargetTokenAmount] = useState('0');
  const [selectedCredit, setSelectedCredit] = useState<string | undefined>(undefined);
  const [drate, setDrate] = useState('10.00');
  const [frate, setFrate] = useState('10.00');
  const [selectedCreditLine] = useSelectedCreditLine();
  const selectedSellTokenAddress = useAppSelector(TokensSelectors.selectSelectedTokenAddress);
  const initialToken: string = selectedSellTokenAddress || DAI;
  console.log('initial token', initialToken, selectedSellTokenAddress, DAI);
  const { selectedSellToken, sourceAssetOptions } = useSelectedSellToken({
    selectedSellTokenAddress: initialToken,
    selectedVaultOrLab: useAppSelector(VaultsSelectors.selectRecommendations)[0],
    allowTokenSelect: true,
  });

  useEffect(() => {
    console.log(
      'add position tx useEffect token/creditLine',
      selectedSellTokenAddress,
      initialToken,
      selectedCreditLine
    );
    if (!selectedSellToken && sourceAssetOptions) {
      dispatch(
        TokensActions.setSelectedTokenAddress({
          tokenAddress: sourceAssetOptions[0].address, // default to DAI and they can update with pick
        })
      );
    }
  }, [initialToken, selectedCreditLine]);

  console.log('deposit x tokens', selectedSellToken, targetTokenAmount, drate, frate);

  const _updatePosition = () =>
    onPositionChange({
      credit: selectedCredit,
      token: selectedSellToken?.address,
      amount: targetTokenAmount,
      drate: drate,
      frate: frate,
    });

  const onAmountChange = (amount: string): void => {
    setTargetTokenAmount(amount);
    _updatePosition();
  };
  const onRateChange = (type: string, amount: string): void => {
    if (type === 'd') setDrate(amount);
    if (type === 'f') setFrate(amount);

    _updatePosition();
  };
  const onCreditChange = (addr: string): void => {
    setSelectedCredit(addr);
    _updatePosition();
  };

  if (!selectedSellToken) return null;

  // const targetBalance = normalizeAmount(selectedSellToken.balance, selectedSellToken.decimals);
  const targetBalance = '100000';
  const tokenHeaderText = `${t('components.transaction.token-input.you-have')} ${formatAmount(
    targetBalance,
    4
  )} ${'DEBT'}`;

  return (
    <StyledTransaction onClose={onClose} header={header || t('components.transaction.title')}>
      <TxCreditInput
        key={'credit-input'}
        headerText={tokenHeaderText}
        inputText={t('components.transaction.add-debt.drawn-rate')}
        amount={targetTokenAmount}
        onCreditChange={onCreditChange}
        amountValue={String(10000000 * Number(targetTokenAmount))}
        selectedToken={selectedSellToken}
        selectedCredit={selectedCredit}
        // creditOptions={sourceCreditOptions}
        // inputError={!!sourceStatus.error}
        readOnly={false}
        // displayGuidance={displaySourceGuidance}
      />
      <TxTokenInput
        key={'token-input'}
        headerText={tokenHeaderText}
        inputText={t('components.transaction.add-debt.drawn-rate')}
        amount={targetTokenAmount}
        onAmountChange={onAmountChange}
        amountValue={String(10000000 * Number(targetTokenAmount))}
        maxAmount={targetBalance}
        selectedToken={selectedSellToken}
        // tokenOptions={sourceAssetOptions}
        // inputError={!!sourceStatus.error}
        readOnly={acceptingOffer}
        // displayGuidance={displaySourceGuidance}
      />
      <TxRateInput
        key={'frate'}
        headerText={t('components.transaction.add-debt.facility-rate')}
        frate={frate}
        drate={drate}
        amount={frate}
        maxAmount={MAX_INTEREST_RATE.toString()}
        // setRateChange={onFrateChange}
        setRateChange={onRateChange}
        readOnly={acceptingOffer}
      />
    </StyledTransaction>
  );
};
