import { FC } from 'react';
import styled from 'styled-components';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

import { Message } from '@types';

import { Markdown } from '../Markdown';
import { Icon, CloseIcon, InfoIcon, WarningFilledIcon, WarningIcon } from '../Icon';

const StyledCloseIcon = styled(Icon)`
  width: 1.5rem;
  height: 1rem;
  margin-top: 2.5px;
  cursor: pointer;
  &:hover {
    opacity: 0.7;
    fill: ${({ theme }) => theme.colors.primaryVariant};
  }
`;

const StyledSymbol = styled(Icon)`
  width: 2.5rem;
  height: 1.6rem;
  margin-right: -2.5px;
`;

const StyledMarkdown = styled(Markdown)`
  a {
    text-decoration: underline;
  }
`;

const StyledNotification = styled.div`
  display: flex;
  align-items: center;
  > * {
    padding-right: 5px;
  }
`;

const StyledBanner = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  height: rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 30px 0px 30px 0px;
`;

const StyledNotificationBanner = styled.div`
  height: rem;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
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
    position: absolute;
    transition: opacity 800ms;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
  }
`;

interface BannerProps {
  notification?: Message;
  onClose?: () => void;
}

export const Banner: FC<BannerProps> = ({ notification, onClose, children }) => {
  if (!notification && !children) {
    return null;
  }

  if (!notification) {
    return <StyledBanner>{children}</StyledBanner>;
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
      <StyledNotificationBanner>
        <StyledTransitionGroup>
          <CSSTransition appear={true} key={notification.id} timeout={800} classNames={'transition'}>
            <StyledNotification>
              <StyledSymbol Component={messageSymbol} />
              <StyledMarkdown>{notification.message}</StyledMarkdown>
              <StyledCloseIcon Component={CloseIcon} onClick={onClose} />
            </StyledNotification>
          </CSSTransition>
        </StyledTransitionGroup>
      </StyledNotificationBanner>
      {children}
    </StyledBanner>
  );
};
