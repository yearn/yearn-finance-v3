import { FC } from 'react';
import styled from 'styled-components';

import { useAppTranslation } from '@hooks';
import { Text, ConstructionIcon, Icon, Modal, Button } from '@components/common';

const StyledButton = styled(Button)`
  background-color: ${({ theme }) => theme.colors.txModalColors.loading};
  text-transform: uppercase;
`;

const StyledIcon = styled(Icon)`
  fill: currentColor;
  width: 9.4rem;
`;

const StyledText = styled(Text)`
  font-size: 2.4rem;
  font-weight: 600;
`;

const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 7rem;
  padding: 9rem 5rem;
  background-color: ${({ theme }) => theme.colors.txModalColors.backgroundVariant};
  border-radius: ${({ theme }) => theme.globalRadius};
`;

const StyledComingSoonModal = styled(Modal)`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.txModal.gap};

  width: ${({ theme }) => theme.txModal.width};
  height: auto;
  color: ${({ theme }) => theme.colors.txModalColors.loading};
  padding: ${({ theme }) => theme.txModal.gap};
  border-radius: ${({ theme }) => theme.globalRadius};
`;

export interface ComingSoonModalProps {
  onClose: () => void;
  modalProps: {
    testVar: string;
  };
}

export const ComingSoonModal: FC<ComingSoonModalProps> = ({ onClose, modalProps, ...props }) => {
  const { t } = useAppTranslation('modals');

  return (
    <StyledComingSoonModal {...props}>
      <TextContainer>
        <StyledText>{t('modals:coming-soon.text')}</StyledText>
        <StyledIcon Component={ConstructionIcon} />
      </TextContainer>

      <StyledButton onClick={onClose}>{t('modals:exit')}</StyledButton>
    </StyledComingSoonModal>
  );
};
