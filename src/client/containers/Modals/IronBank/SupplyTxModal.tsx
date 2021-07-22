import { FC } from 'react';
import styled from 'styled-components';

import { ModalTx } from '@components/common';
import { IronBankSupplyTx } from '@components/app/Transactions';

const StyledIronBankSupplyTxModal = styled(ModalTx)``;

export interface IronBankSupplyTxModalProps {
  onClose: () => void;
}

export const IronBankSupplyTxModal: FC<IronBankSupplyTxModalProps> = ({ onClose, ...props }) => {
  return (
    <StyledIronBankSupplyTxModal {...props}>
      <IronBankSupplyTx onClose={onClose} />
    </StyledIronBankSupplyTxModal>
  );
};
