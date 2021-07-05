import { FC } from 'react';
import styled from 'styled-components';

import { Icon, CloseIcon } from '@components/common';

export interface TxContainerProps {
  header: string;
  onClose?: () => void;
}

const actionsPadding = '.6rem';

const StyledIcon = styled(Icon)`
  fill: inherit;
  width: 1.6rem;
  height: 1.6rem;
`;

const HeaderAction = styled.div`
  padding: ${actionsPadding};
  cursor: pointer;
  transition: fill 200ms ease-in-out;
  fill: ${({ theme }) => theme.colors.txModalColors.text};

  :hover {
    fill: ${({ theme }) => theme.colors.txModalColors.textContrast};
  }
`;

const TxHeaderActions = styled.div`
  display: flex;
  align-items: center;
  margin: -${actionsPadding};
`;

const TxHeaderTitle = styled.div`
  color: ${({ theme }) => theme.colors.txModalColors.textContrast};
`;

const TxContainerContent = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: ${({ theme }) => theme.txModal.gap};
  position: relative;
  border-radius: ${({ theme }) => theme.globalRadius};
`;

const TxHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 1.8rem;
  font-weight: bold;
`;

const StyledTxContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.txModal.gap};
  width: 100%;
  background: ${({ theme }) => theme.colors.txModalColors.background};
  color: ${({ theme }) => theme.colors.txModalColors.text};
  border-radius: ${({ theme }) => theme.globalRadius};
  gap: ${({ theme }) => theme.txModal.gap};
`;

export const TxContainer: FC<TxContainerProps> = ({ header, onClose, children, ...props }) => {
  let closeButton;

  if (onClose) {
    closeButton = (
      <HeaderAction onClick={onClose}>
        <StyledIcon Component={CloseIcon} />
      </HeaderAction>
    );
  }

  return (
    <StyledTxContainer {...props}>
      <TxHeader>
        <TxHeaderTitle>{header}</TxHeaderTitle>
        <TxHeaderActions>{closeButton}</TxHeaderActions>
      </TxHeader>

      <TxContainerContent>{children}</TxContainerContent>
    </StyledTxContainer>
  );
};
