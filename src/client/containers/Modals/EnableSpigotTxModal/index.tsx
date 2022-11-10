import { FC } from 'react';
import styled from 'styled-components';

import { useAppTranslation } from '@hooks';
import { ModalTx } from '@components/common';
import { EnableSpigotTx } from '@components/app';

const StyledEnableSpigotTxModal = styled(ModalTx)``;
export interface EnableSpigotTxModalProps {
  onClose: () => void;
}

export const EnableSpigotTxModal: FC<EnableSpigotTxModalProps> = ({ onClose, ...props }) => {
  console.log('deposit modal', props);
  const { t } = useAppTranslation('common');
  // if (!creditLine) return; // TODO error or creditLine selector input

  return (
    <StyledEnableSpigotTxModal {...props}>
      <EnableSpigotTx header={t('components.transaction.enable-collateral-asset.header')} onClose={onClose} />
    </StyledEnableSpigotTxModal>
  );
};
