import { FC } from 'react';
import styled from 'styled-components';

import { useAppTranslation } from '@hooks';
import { ModalTx } from '@components/common';
import { MigrateTx } from '@components/app/Transactions';

const StyledMigrateTxModal = styled(ModalTx)``;
export interface MigrateTxModalProps {
  onClose: () => void;
}

export const MigrateTxModal: FC<MigrateTxModalProps> = ({ onClose, ...props }) => {
  const { t } = useAppTranslation('common');

  return (
    <StyledMigrateTxModal {...props}>
      <MigrateTx header={t('components.transaction.migrate')} onClose={onClose} />
    </StyledMigrateTxModal>
  );
};
