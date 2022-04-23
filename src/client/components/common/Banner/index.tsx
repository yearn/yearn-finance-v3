import { FC } from 'react';
import styled from 'styled-components';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

import { Message } from '@types';

import { Markdown } from '../Markdown';
import { Icon, CloseIcon, InfoIcon, WarningFilledIcon, WarningIcon } from '../Icon';

const StyledCloseIcon = styled(Icon)`
  width: 2rem;
  padding: 2rem;
  right: 0;
  margin: -2rem;
  margin-left: 0;
  cursor: pointer;
  fill: currentColor;
  box-sizing: content-box;

  &:hover {
    opacity: 0.7;
  }
`;

const StyledSymbol = styled(Icon)`
  width: 2.5rem;
  fill: currentColor;
  margin-right: 0.8rem;
`;

const StyledMarkdown = styled(Markdown)`
  flex: 1;
  a {
    text-decoration: underline;
  }
`;

const StyledNotification = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.alerts.info.background};
  color: ${({ theme }) => theme.alerts.info.color};
  padding: 2.5rem;
  bottom: 0;
  left: 0;
  width: 100%;
  flex: 1;
  z-index: ${({ theme }) => theme.zindex.alerts};
  position: fixed;
`;

const StyledTransitionGroup = styled(TransitionGroup)`
  .transition-appear {
    opacity: 0;
  }
  .transition-appear-active {
    opacity: 1;
    transition: opacity 800ms;
  }
  .transition-enter {
    opacity: 0;
  }
  .transition-enter-active {
    opacity: 1;
    transition: opacity 800ms;
  }
  .transition-exit {
    opacity: 1;
  }
  .transition-exit-active {
    opacity: 0;
    position: fixed;
    transition: opacity 800ms;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
  }
`;

const StyledBanner = styled.div``;

interface BannerProps {
  notification?: Message;
  onClose?: () => void;
}

export const Banner: FC<BannerProps> = ({ notification, onClose }) => {
  if (!notification) {
    return null;
  }

  let messageSymbol: React.FunctionComponent<React.SVGProps<SVGSVGElement> & { title?: string | undefined }>;
  switch (notification.type) {
    case 'info':
      messageSymbol = InfoIcon;
      break;
    case 'warning':
      messageSymbol = WarningFilledIcon;
      break;
    case 'critical':
      messageSymbol = WarningIcon;
      break;
    default:
      messageSymbol = InfoIcon;
  }

  return (
    <StyledBanner>
      <StyledTransitionGroup>
        <CSSTransition appear key={notification.id} timeout={800} classNames={'transition'}>
          <StyledNotification>
            <StyledSymbol Component={messageSymbol} />
            <StyledMarkdown>{notification.message}</StyledMarkdown>
            <StyledCloseIcon Component={CloseIcon} onClick={onClose} />
          </StyledNotification>
        </CSSTransition>
      </StyledTransitionGroup>
    </StyledBanner>
  );
};
