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
import { TxTTLInput } from './components/TxTTLInput';
import { TxRateInput } from './components/TxRateInput';
import { TxActions } from './components/TxActions';
import { TxActionButton } from './components/TxActions';

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

  const onAmountChange = () => {};

  return (
    <StyledTransaction onClose={onClose} header={header || t('components.transaction.title')}>
      <TxCreditLineInput
        key={'credit-input'}
        headerText={t('components.transaction.deploy-line.select-borrower')}
        inputText={t('components.transaction.deploy-line.select-borrower')}
        onSelectedCreditLineChange={() => {}}
        selectedCredit={selectedCredit as CreditLine}
        // creditOptions={sourceCreditOptions}
        // inputError={!!sourceStatus.error}
        readOnly={false}
        // displayGuidance={displaySourceGuidance}
      />
      <TxTTLInput
        headerText={t('components.transaction.deploy-line.select-ttl')}
        inputText={t('components.transaction.deploy-line.time-to-live')}
        inputError={false}
        amount={''}
        onAmountChange={onAmountChange}
        maxAmount={''}
        maxLabel={''}
        readOnly={false}
        hideAmount={false}
        loading={false}
        loadingText={''}
      />
      <TxActions>
        <TxActionButton key={''} onClick={() => {}} disabled={false} contrast={false} isLoading={false}>
          {'Deploy Line'}
        </TxActionButton>
      </TxActions>
    </StyledTransaction>
  );
};
