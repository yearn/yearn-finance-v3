import { FC } from 'react';
import styled from 'styled-components';

import { useAppTranslation } from '@hooks';
import { ModalTx } from '@components/common';
import { BorrowCreditTx } from '@components/app';

const StyledBorrowTxModal = styled(ModalTx)``;
export interface BorrowTxModalProps {
  onClose: () => void;
}

export const BorrowTxModal: FC<BorrowTxModalProps> = ({ onClose, ...props }) => {
  console.log('borrow modal', props);
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
    <StyledBorrowTxModal {...props}>
      <BorrowCreditTx
        header={t('components.transaction.borrow-credit.header')} // TODO
        acceptingOffer={false}
        onClose={onClose}
        onSelectedCreditLineChange={onSelectedCreditLineChange}
        onPositionChange={onPositionChange}
      />
    </StyledBorrowTxModal>
  );
};
