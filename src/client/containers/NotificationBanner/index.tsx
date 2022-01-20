import { FC } from 'react';
import { first } from 'lodash';
import styled from 'styled-components';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

import { useAppSelector, useAppDispatch } from '@hooks';
import { NotificationsActions, NotificationsSelectors } from '@store';
import { Banner, Markdown, Icon, CloseIcon, InfoIcon, WarningFilledIcon, WarningIcon } from '@components/common';

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

const StyledNotificationBanner = styled.div`
  background: ${({ theme }) => theme.colors.surface};
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

export const NotificationBanner: FC = () => {
  const latestMessage = first(useAppSelector(NotificationsSelectors.selectActiveMessages));
  const dispatch = useAppDispatch();
  if (!latestMessage) {
    return null;
  }

  let messageSymbol: React.FunctionComponent<React.SVGProps<SVGSVGElement> & { title?: string | undefined }>;
  switch (latestMessage.type) {
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
    <StyledNotificationBanner>
      <StyledTransitionGroup>
        <CSSTransition appear={true} key={latestMessage.id} timeout={800} classNames={'transition'}>
          <Banner>
            <StyledNotification>
              <StyledSymbol Component={messageSymbol} />
              <StyledMarkdown>{latestMessage.message}</StyledMarkdown>
              <StyledCloseIcon
                Component={CloseIcon}
                onClick={() => dispatch(NotificationsActions.dismissMessage(latestMessage.id))}
              />
            </StyledNotification>
          </Banner>
        </CSSTransition>
      </StyledTransitionGroup>
    </StyledNotificationBanner>
  );
};
