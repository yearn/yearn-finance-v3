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
import { Address, Token, Asset, TokenView, CreditLine } from '@src/core/types';
import { TokensActions, TokensSelectors, VaultsSelectors, VaultsActions } from '@store';

import { TxContainer } from './components/TxContainer';
import { TxTokenInput } from './components/TxTokenInput';
import { TxCreditLineInput } from './components/TxCreditLineInput';
import { TxRateInput } from './components/TxRateInput';
import { TxActionButton, TxActions } from './components/TxActions';

const {
  CONTRACT_ADDRESSES: { DAI },
  MAX_INTEREST_RATE,
} = getConstants();
const StyledTransaction = styled(TxContainer)``;

interface LiquidateBorrowerProps {
  header: string;
  onClose: () => void;
  onSelectedCreditLineChange: Function;
  allowVaultSelect: boolean;
  onPositionChange: (data: { credit?: string; token?: string; amount?: string }) => void;
}

const RatesContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

export const LiquidateBorrowerTx: FC<LiquidateBorrowerProps> = (props) => {
  const { t } = useAppTranslation('common');
  const dispatch = useAppDispatch();
  const { allowVaultSelect, header, onClose, onPositionChange } = props;

  const [targetTokenAmount, setTargetTokenAmount] = useState('10000000');
  const [drate, setDrate] = useState('0.00');
  const [frate, setFrate] = useState('0.00');
  const [selectedCredit, setSelectedCredit] = useSelectedCreditLine();
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
    });

  // Event Handlers

  const onAmountChange = (amount: string): void => {
    setTargetTokenAmount(amount);
    _updatePosition();
  };

  const onSelectedCreditLineChange = (addr: string): void => {
    console.log('select new loc', addr);
    setSelectedCredit(addr);
    _updatePosition();
  };

  if (!selectedSellToken) return null;

  const targetBalance = normalizeAmount(selectedSellToken.balance, selectedSellToken.decimals);
  const tokenHeaderText = `${t('components.transaction.token-input.you-have')} ${formatAmount(targetBalance, 4)} ${
    selectedSellToken.symbol
  }`;

  return (
    <StyledTransaction onClose={onClose} header={header || t('components.transaction.title')}>
      <TxCreditLineInput
        key={'credit-input'}
        headerText={t('components.transaction.arbiter-liquidate.select-credit')}
        inputText={t('components.transaction.arbiter-liquidate.select-credit')}
        onSelectedCreditLineChange={onSelectedCreditLineChange}
        selectedCredit={selectedCredit as CreditLine}
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
        onSelectedTokenChange={() => {}}
        tokenOptions={sourceAssetOptions}
      />
      <TxActions>
        <TxActionButton>{'Liquidate'}</TxActionButton>
      </TxActions>
    </StyledTransaction>
  );
};
