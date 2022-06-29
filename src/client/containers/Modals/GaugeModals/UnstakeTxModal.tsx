import { FC } from 'react';

import { useAppTranslation } from '@hooks';
import { ModalTx } from '@components/common';
import { UnstakeTx } from '@components/app';

export interface GaugeUnstakeTxModalProps {
  onClose: () => void;
}

export const GaugeUnstakeTxModal: FC<GaugeUnstakeTxModalProps> = ({ onClose, ...props }) => {
  const { t } = useAppTranslation('common');
  return (
    <ModalTx {...props}>
      <UnstakeTx header={t('components.transaction.unstake')} onClose={onClose} />
    </ModalTx>
  );
};
