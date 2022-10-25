import { FC } from 'react';
import styled from 'styled-components';

import { useAppTranslation } from '@hooks';
import { ModalTx } from '@components/common';
import { DepositAndRepayTx } from '@components/app';

const StyledDepositAndRepayTxModal = styled(ModalTx)``;
export interface DepositAndRepayTxModalProps {
  onClose: () => void;
}

export const DepositAndRepayTxModal: FC<DepositAndRepayTxModalProps> = ({ onClose, ...props }) => {
  console.log('deposit and repay modal', props);
  const { t } = useAppTranslation('common');
  // if (!creditLine) return; // TODO error or creditLine selector input

  const onSelectedCreditLineChange = () => {
    // new creditLine selected to invest in
    // setSelected()
  };

  const onPositionChange = () => {
    // update deposit params
  };

  return (
    <StyledDepositAndRepayTxModal {...props}>
      <DepositAndRepayTx
        header={t('components.transaction.deposit-and-repay.header')} // TODO
        acceptingOffer={false}
        onClose={onClose}
        onSelectedCreditLineChange={onSelectedCreditLineChange}
        onPositionChange={onPositionChange}
      />
    </StyledDepositAndRepayTxModal>
  );
};
