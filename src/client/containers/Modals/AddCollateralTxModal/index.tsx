import { FC } from 'react';
import styled from 'styled-components';

import { useAppTranslation } from '@hooks';
import { ModalTx } from '@components/common';
import { AddCollateralTx } from '@components/app';

const StyledAddCreditPositionTxModal = styled(ModalTx)``;
export interface AddCreditPositionTxModalProps {
  onClose: () => void;
}

export const AddCollateralTxModal: FC<AddCreditPositionTxModalProps> = ({ onClose, ...props }) => {
  const { t } = useAppTranslation('common');
  // if (!creditLine) return; // TODO error or creditLine selector input

  return (
    <StyledAddCreditPositionTxModal {...props}>
      <AddCollateralTx header={t('components.transaction.add-collateral.header')} onClose={onClose} />
    </StyledAddCreditPositionTxModal>
  );
};
