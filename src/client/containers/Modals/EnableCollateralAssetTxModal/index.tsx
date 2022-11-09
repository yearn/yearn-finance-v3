import { FC } from 'react';
import styled from 'styled-components';

import { useAppTranslation } from '@hooks';
import { ModalTx } from '@components/common';
import { EnableCollateralAssetTx } from '@components/app';

const StyledEnableCollateralAssetTxModal = styled(ModalTx)``;
export interface EnableCollateralAssetTxModalProps {
  onClose: () => void;
}

export const EnableCollateralAssetTxModal: FC<EnableCollateralAssetTxModalProps> = ({ onClose, ...props }) => {
  console.log('deposit modal', props);
  const { t } = useAppTranslation('common');
  // if (!creditLine) return; // TODO error or creditLine selector input

  return (
    <StyledEnableCollateralAssetTxModal {...props}>
      <EnableCollateralAssetTx header={t('components.transaction.enable-collateral-asset.header')} onClose={onClose} />
    </StyledEnableCollateralAssetTxModal>
  );
};
