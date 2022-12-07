import { FC } from 'react';
import styled from 'styled-components';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

import { Box, Icon, ChevronLeftIcon } from '@components/common';

const scaleTransitionTime = 300;

const StyledContainer = styled(TransitionGroup)`
  display: grid;
  width: 100%;
  border-radius: ${({ theme }) => theme.globalRadius};
  grid-gap: 0.8rem;

  .scale-enter {
    opacity: 0;
    transform: scale(0);
    transition: opacity ${scaleTransitionTime}ms ease, transform ${scaleTransitionTime}ms ease;
  }

  .scale-enter-active {
    opacity: 1;
    transform: scale(1);
  }

  .scale-exit {
    opacity: 1;
    transform: scale(1);
  }

  .scale-exit-active {
    opacity: 0;
    transform: scale(0);
    transition: opacity ${scaleTransitionTime}ms ease, transform ${scaleTransitionTime}ms cubic-bezier(1, 0.5, 0.8, 1);
  }
`;

const StyledBox = styled(Box)`
  position: absolute;
  display: flex;
  flex-direction: column;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 1.6rem;
  gap: 1.6rem;
  max-height: 60rem;
  font-size: 1.6rem;
  text-align: justify;
  overflow: hidden;
  user-select: none;
  z-index: 1;
  background: ${({ theme }) => theme.colors.txModalColors.backgroundVariant};
  color: ${({ theme }) => theme.colors.texts};
  fill: ${({ theme }) => theme.colors.texts};
  border-radius: ${({ theme }) => theme.globalRadius};
  transform-origin: bottom;
`;

const BackButton = styled(Icon)`
  position: absolute;
  fill: inherit;
  height: 1.6rem;
  left: 0;
  padding: 1rem;
  margin-left: -1rem;
  box-sizing: content-box;
  cursor: pointer;
`;

const HeaderTitle = styled.div`
  color: ${({ theme }) => theme.colors.titles};
  font-size: 1.6rem;
  font-weight: 700;
  flex: 1;
  text-align: center;
`;

const Header = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

interface TxInformationProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
}

export const TxInformation: FC<TxInformationProps> = ({ title, isOpen, onClose, children }) => {
  return (
    <StyledContainer>
      {isOpen && (
        <CSSTransition in={isOpen} appear={true} timeout={scaleTransitionTime} classNames="scale">
          <StyledBox>
            <Header>
              {onClose && <BackButton Component={ChevronLeftIcon} onClick={onClose} />}
              <HeaderTitle>{title}</HeaderTitle>
            </Header>
            {children}
          </StyledBox>
        </CSSTransition>
      )}
    </StyledContainer>
  );
};
