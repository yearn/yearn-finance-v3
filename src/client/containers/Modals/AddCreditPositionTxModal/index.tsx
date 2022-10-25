import { FC } from 'react';
import styled from 'styled-components';

import { useAppTranslation } from '@hooks';
import { ModalTx } from '@components/common';
import { AddCreditPositionTx } from '@components/app';

const StyledAddCreditPositionTxModal = styled(ModalTx)``;
export interface AddCreditPositionTxModalProps {
  onClose: () => void;
}

export const AddCreditPositionTxModal: FC<AddCreditPositionTxModalProps> = ({ onClose, ...props }) => {
  console.log('deposit modal', props);
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
    <StyledAddCreditPositionTxModal {...props}>
      <AddCreditPositionTx
        header={t('components.transaction.add-credit.header')} // TODO
        acceptingOffer={false}
        onClose={onClose}
        onSelectedCreditLineChange={onSelectedCreditLineChange}
        onPositionChange={onPositionChange}
      />
    </StyledAddCreditPositionTxModal>
  );
};
