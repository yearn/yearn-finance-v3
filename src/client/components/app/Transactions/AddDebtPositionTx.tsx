import React, { FC, useState, useEffect } from 'react';
import styled from 'styled-components';
import { TokenCard } from '@yearn-finance/web-lib';

import { formatAmount, normalizeAmount, toBN } from '@utils';
import {
  useAppTranslation,
  useAppDispatch,
  useSelectedLoan,

  // used to dummy token for dev
  useAppSelector,
  useSelectedSellToken,
} from '@hooks';
import { getConstants } from '@src/config/constants';
import { Address, Token, Asset, EXAMPLE_TOKEN } from '@src/core/types';
import { TokensActions, TokensSelectors, VaultsSelectors, VaultsActions } from '@store';

import { TxContainer } from './components/TxContainer';
import { TxTokenInput } from './components/TxTokenInput';
import { TxRateInput } from './components/TxRateInput';

const {
  CONTRACT_ADDRESSES: { DAI },
  MAX_INTEREST_RATE,
} = getConstants();
const StyledTransaction = styled(TxContainer)``;

interface AddDebtPositionProps {
  header: string;
  onClose: () => void;
  acceptingOffer: boolean;
  onLoanChange: Function;
  allowVaultSelect: boolean;
  onPositionChange: (amount: string, drate: string, frate: string) => void;
}

const RatesContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

export const AddDebtPositionTx: FC<AddDebtPositionProps> = (props) => {
  const { t } = useAppTranslation('common');
  const dispatch = useAppDispatch();
  const { allowVaultSelect, header, onClose, onPositionChange } = props;
  const [targetTokenAmount, setTargetTokenAmount] = useState('0');
  const [drate, setDrate] = useState('100');
  const [frate, setFrate] = useState('100');

  const _updatePosition = () => onPositionChange(targetTokenAmount, drate, frate);
  const onAmountChange = (amount: string): void => {
    setTargetTokenAmount(amount);
    _updatePosition();
  };
  const onRateChange = (type: string, amount: string): void => {
    if (type === 'd') setDrate(amount);
    if (type === 'f') setFrate(amount);
    if (type === 'all') {
      setDrate(amount);
      setFrate(amount);
    }
    _updatePosition();
  };
  const [selectedLoan] = useSelectedLoan();
  const selectedSellTokenAddress = useAppSelector(TokensSelectors.selectSelectedTokenAddress);
  const { selectedSellToken, sourceAssetOptions } = useSelectedSellToken({
    selectedSellTokenAddress: selectedSellTokenAddress,
    selectedVaultOrLab: useAppSelector(VaultsSelectors.selectSelectedVault),
    allowTokenSelect: true,
  });
  // const targetBalance = normalizeAmount(selectedSellToken.balance, selectedSellToken.decimals);
  const targetBalance = '100000';
  const tokenHeaderText = `${t('components.transaction.token-input.you-have')} ${formatAmount(
    targetBalance,
    4
  )} ${'DEBT'}`;

  useEffect(() => {
    if (!selectedSellTokenAddress && selectedLoan) {
      dispatch(
        TokensActions.setSelectedTokenAddress({
          tokenAddress: DAI, // default to DAI and they can update with pick
        })
      );
    }
  }, [selectedSellTokenAddress, selectedLoan]);

  console.log('add position tx', selectedSellToken, targetTokenAmount, drate, frate);
  if (!selectedSellToken) return null;

  return (
    <StyledTransaction onClose={onClose} header={header || t('omponents.transaction.title')}>
      <TxTokenInput
        headerText={tokenHeaderText}
        inputText={t('components.transaction.add-debt.input')}
        amount={targetTokenAmount}
        onAmountChange={onAmountChange}
        amountValue={String(10000000 * Number(targetTokenAmount))}
        maxAmount={targetBalance}
        selectedToken={selectedSellToken}
        // tokenOptions={sourceAssetOptions}
        // inputError={!!sourceStatus.error}
        readOnly={false}
        // displayGuidance={displaySourceGuidance}
      />
      <TxRateInput
        headerText={t('components.transaction.add-debt.facility-rate')}
        inputText={'1.5%'}
        frate={frate}
        drate={drate}
        amount={frate}
        maxAmount={MAX_INTEREST_RATE.toString()}
        // onAmountChange={onFrateChange}
        onAmountChange={onRateChange}
        readOnly={!false}
      />
    </StyledTransaction>
  );
};
