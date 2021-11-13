import { FC } from 'react';
import styled from 'styled-components';

import { Modal } from '@components/common';

const CustomThemesList = styled.div`
  display: flex;
  flex: 1;
`;

const StyledCommunityThemesModal = styled(Modal)`
  width: 38.5rem;
`;
export interface CommunityThemesModalProps {
  onClose: () => void;
}

export const CommunityThemesModal: FC<CommunityThemesModalProps> = ({ onClose, ...props }) => {
  return (
    <StyledCommunityThemesModal {...props} onClose={onClose}>
      Custom theme gallery
      <CustomThemesList>test</CustomThemesList>
    </StyledCommunityThemesModal>
  );
};
