import React from 'react';
import styled from 'styled-components/macro';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

import { useAppSelector } from '@hooks';
import { AlertsSelectors } from '@store';

import { Alert } from './Alert';

const StyledAlerts = styled(TransitionGroup)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: flex-start;
  pointer-events: none;
  z-index: ${({ theme }) => theme.zindex.alerts};
  gap: 1rem;
  padding: 2rem;

  .slideBottom-enter {
    opacity: 0;
    // transform: translate3d(0, 100vh, 0);
    transition: all 300ms ease-in;
  }
  .slideBottom-enter-active {
    opacity: 1;
    transform: translate3d(0, 0, 0);
    transition: all 300ms ease;
  }
  .slideBottom-exit-active {
    opacity: 0;
    transform: translate3d(0, 100vh, 0);
    transition: all 300ms cubic-bezier(1, 0.5, 0.8, 1);
  }
`;

export const Alerts = () => {
  const alertsList = useAppSelector(AlertsSelectors.selectAlerts);
  return (
    <StyledAlerts>
      {alertsList?.map((alert) => {
        // NOTE #N1 NodeRef could be removed, but using it clears a noisy warning in development
        const nodeRef: { current: null | HTMLDivElement } = React.createRef();

        return (
          <CSSTransition key={alert.id} timeout={500} classNames="slideBottom" nodeRef={nodeRef}>
            {/* This div could be removed but read NOTE #N1 */}
            <div ref={nodeRef}>
              <Alert id={alert.id} type={alert.type}>
                {alert.message}
              </Alert>
            </div>
          </CSSTransition>
        );
      })}
    </StyledAlerts>
  );
};
