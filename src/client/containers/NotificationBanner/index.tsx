import { FC } from 'react';
import { first } from 'lodash';
import styled from 'styled-components';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { useAppSelector, useAppDispatch } from '@hooks';
import { NotificationsActions, NotificationsSelectors } from '@store';
import { Banner, Markdown, Icon, CloseIcon } from '@src/client/components/common';

const StyledIcon = styled(Icon)`
  width: 1.5rem;
  height: 1rem;
  margin-top: 2.5px;
  &: hover {
    fill: ${({ theme }) => theme.colors.primaryVariant};
  }
`;

const StyledClose = styled.div`
  cursor: pointer;
  &: hover {
    opacity: 0.7;
  }
`;

const StyledMarkdown = styled(Markdown)`
  a {
    text-decoration: underline;
  }
`;

const StyledNotification = styled.div`
  display: flex;
  align-items: center;
  column-gap: 5px;
`;

const StyledNotificationBanner = styled(TransitionGroup)`
  .transition-enter {
    opacity: 0;
  }
  .transition-enter-active {
    opacity: 1;
    transition: opacity 600ms;
  }
  .transition-exit {
    opacity: 1;
  }
  .transition-exit-active {
    opacity: 0;
    transition: opacity 600ms;
`;

export const NotificationBanner: FC = () => {
  const latestMessage = first(useAppSelector(NotificationsSelectors.selectActiveMessages));
  const dispatch = useAppDispatch();

  let messageSymbol = '';
  if (latestMessage) {
    switch (latestMessage.type) {
      case 'info':
        messageSymbol = 'ⓘ';
        break;
      case 'warning':
        messageSymbol = '⚠';
        break;
      case 'critical':
        messageSymbol = '⚠⚠⚠';
        break;
      default:
        messageSymbol = '';
    }
  }

  return (
    <StyledNotificationBanner>
      {latestMessage && (
        <CSSTransition key={latestMessage.id} timeout={600} classNames="transition">
          <Banner>
            <StyledNotification>
              {messageSymbol}
              <StyledMarkdown>{latestMessage.message}</StyledMarkdown>
              <StyledClose onClick={() => dispatch(NotificationsActions.dismissMessage(latestMessage.id))}>
                <StyledIcon Component={CloseIcon} />
              </StyledClose>
            </StyledNotification>
          </Banner>
        </CSSTransition>
      )}
    </StyledNotificationBanner>
  );
};
