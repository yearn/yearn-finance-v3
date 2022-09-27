import { FC, useState, useEffect } from 'react';
import styled from 'styled-components';

import { formatAmount, normalizeAmount, toBN } from '@utils';
import {
  useAppTranslation,
  useAppDispatch,

  // used to dummy token for dev
  useAppSelector,
  useSelectedSellToken,
} from '@hooks';
import { getConstants } from '@src/config/constants';
import { TokensActions, TokensSelectors, VaultsSelectors, VaultsActions } from '@store';
import { useSelectedCreditLine } from '@hooks';
import { Address, Token, Asset, TokenView, CreditLine } from '@src/core/types';

import { TxContainer } from './components/TxContainer';
import { TxTokenInput } from './components/TxTokenInput';
import { TxCreditLineInput } from './components/TxCreditLineInput';
import { TxRateInput } from './components/TxRateInput';

const {
  CONTRACT_ADDRESSES: { DAI },
  MAX_INTEREST_RATE,
} = getConstants();
const StyledTransaction = styled(TxContainer)``;

interface DeployLineProps {
  header: string;
  onClose: () => void;
  allowVaultSelect: boolean;
  onPositionChange: (data: {
    credit?: string;
    token?: string;
    amount?: string;
    drate?: string;
    frate?: string;
  }) => void;
}

export const DeployLineTx: FC<DeployLineProps> = (props) => {
  const { t } = useAppTranslation('common');
  const dispatch = useAppDispatch();
  const [selectedCredit, setSelectedCredit] = useSelectedCreditLine();
  const { allowVaultSelect, header, onClose, onPositionChange } = props;

  return (
    <StyledTransaction onClose={onClose} header={header || t('components.transaction.title')}>
      <TxCreditLineInput
        key={'credit-input'}
        headerText={t('components.transaction.add-credit.select-credit')}
        inputText={t('components.transaction.add-credit.select-credit')}
        onSelectedCreditLineChange={() => {}}
        selectedCredit={selectedCredit as CreditLine}
        // creditOptions={sourceCreditOptions}
        // inputError={!!sourceStatus.error}
        readOnly={false}
        // displayGuidance={displaySourceGuidance}
      />
    </StyledTransaction>
  );
};
