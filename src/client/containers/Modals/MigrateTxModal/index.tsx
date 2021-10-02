import { FC } from 'react';
import styled from 'styled-components';

import { ModalTx } from '@components/common';
import { MigrateTx } from '@components/app/Transactions';

const StyledMigrateTxModal = styled(ModalTx)``;
export interface MigrateTxModalProps {
  onClose: () => void;
}

export const MigrateTxModal: FC<MigrateTxModalProps> = ({ onClose, ...props }) => {
  return (
    <StyledMigrateTxModal {...props}>
      <MigrateTx header="Migrate" onClose={onClose} />
    </StyledMigrateTxModal>
  );
};
