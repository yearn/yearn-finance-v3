import { FC } from 'react';
import styled from 'styled-components';

import { ModalTx } from '@components/common';
import { IronBankRepayTx } from '@components/app/Transactions';

const StyledIronBankRepayTxModal = styled(ModalTx)``;

export interface IronBankRepayTxModalProps {
  onClose: () => void;
}

export const IronBankRepayTxModal: FC<IronBankRepayTxModalProps> = ({ onClose, ...props }) => {
  return (
    <StyledIronBankRepayTxModal {...props}>
      <IronBankRepayTx onClose={onClose} />
    </StyledIronBankRepayTxModal>
  );
};
