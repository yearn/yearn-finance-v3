import { FC } from 'react';
import styled from 'styled-components';

import { ModalTx } from '@components/common';
import { IronBankBorrowTx } from '@components/app';

const StyledIronBankBorrowTxModal = styled(ModalTx)``;

export interface IronBankBorrowTxModalProps {
  onClose: () => void;
}

export const IronBankBorrowTxModal: FC<IronBankBorrowTxModalProps> = ({ onClose, ...props }) => {
  return (
    <StyledIronBankBorrowTxModal {...props}>
      <IronBankBorrowTx onClose={onClose} />
    </StyledIronBankBorrowTxModal>
  );
};
