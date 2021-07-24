import { FC } from 'react';
import styled from 'styled-components';

import { ModalTx } from '@components/common';
import { IronBankWithdrawTx } from '@components/app/Transactions';

const StyledIronBankWithdrawTxModal = styled(ModalTx)``;

export interface IronBankWithdrawTxModalProps {
  onClose: () => void;
}

export const IronBankWithdrawTxModal: FC<IronBankWithdrawTxModalProps> = ({ onClose, ...props }) => {
  return (
    <StyledIronBankWithdrawTxModal {...props}>
      <IronBankWithdrawTx onClose={onClose} />
    </StyledIronBankWithdrawTxModal>
  );
};
