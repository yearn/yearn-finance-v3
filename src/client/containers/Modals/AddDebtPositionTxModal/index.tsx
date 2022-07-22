import { FC } from 'react';
import styled from 'styled-components';

import { useAppTranslation, useSelectedLoan } from '@hooks';
import { ModalTx } from '@components/common';
import { AddDebtPositionTx } from '@components/app';

const StyledAddDebtPositionTxModal = styled(ModalTx)``;
export interface AddDebtPositionTxModalProps {
  onClose: () => void;
  modalProps?: {
    allowVaultSelect: boolean;
  };
}

export const AddDebtPositionTxModal: FC<AddDebtPositionTxModalProps> = ({
  onClose,
  modalProps = { allowVaultSelect: false },
  ...props
}) => {
  console.log('deposit modal', props);
  const { t } = useAppTranslation('common');
  const [loan] = useSelectedLoan();
  // if (!loan) return; // TODO error or loan selector input
  const onLoanChange = () => {
    // new loan selected to invest in
  };
  const onPositionChange = () => {
    // update deposit params
  };

  return (
    <StyledAddDebtPositionTxModal {...props}>
      <AddDebtPositionTx
        header={t('components.transaction.add-position.header')} // TODO
        acceptingOffer={false}
        allowVaultSelect={modalProps.allowVaultSelect}
        onClose={onClose}
        onLoanChange={onLoanChange}
        onPositionChange={onPositionChange}
      />
    </StyledAddDebtPositionTxModal>
  );
};
