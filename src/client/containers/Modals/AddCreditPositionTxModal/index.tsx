import { FC } from 'react';
import styled from 'styled-components';

import { useAppTranslation, useSelectedCreditLine } from '@hooks';
import { ModalTx } from '@components/common';
import { AddCreditPositionTx } from '@components/app';

const StyledAddCreditPositionTxModal = styled(ModalTx)``;
export interface AddCreditPositionTxModalProps {
  onClose: () => void;
  modalProps?: {
    allowVaultSelect: boolean;
  };
}

export const AddCreditPositionTxModal: FC<AddCreditPositionTxModalProps> = ({
  onClose,
  modalProps = { allowVaultSelect: false },
  ...props
}) => {
  console.log('deposit modal', props);
  const { t } = useAppTranslation('common');
  const [creditLine] = useSelectedCreditLine();
  // if (!creditLine) return; // TODO error or creditLine selector input
  const onCreditLineChange = () => {
    // new creditLine selected to invest in
  };
  const onPositionChange = () => {
    // update deposit params
  };

  return (
    <StyledAddCreditPositionTxModal {...props}>
      <AddCreditPositionTx
        header={t('components.transaction.add-position.header')} // TODO
        acceptingOffer={false}
        allowVaultSelect={modalProps.allowVaultSelect}
        onClose={onClose}
        onCreditLineChange={onCreditLineChange}
        onPositionChange={onPositionChange}
      />
    </StyledAddCreditPositionTxModal>
  );
};
