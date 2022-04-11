import { FC } from 'react';
import styled from 'styled-components';

import { useAppDispatch } from '@hooks';
import { AlertsActions } from '@store';
import { Icon, CloseIcon } from '@components/common';
import { AlertTypes } from '@types';

const StyledAlert = styled.div<{ type: AlertTypes }>`
  overflow: hidden;
  overflow-y: auto;
  padding: 1.3rem;
  position: relative;
  pointer-events: all;
  z-index: 1;
  width: 27rem;
  max-width: 100%;
  max-height: 100%;
  position: relative;
  border-radius: ${({ theme }) => theme.globalRadius};
  transform: translate3d(0, 0, 0);

  ${({ type, theme }) => {
    let background = theme.alerts.default.background;
    let color = theme.alerts.default.color;

    if (type === 'error') {
      background = theme.alerts.error.background;
      color = theme.alerts.error.color;
    } else if (type === 'success') {
      background = theme.alerts.success.background;
      color = theme.alerts.success.color;
    } else if (type === 'info') {
      background = theme.alerts.info.background;
      color = theme.alerts.info.color;
    } else if (type === 'warning') {
      background = theme.alerts.warning.background;
      color = theme.alerts.warning.color;
    }
    return `background: ${background}; color: ${color}; fill: ${color}`;
  }}
`;

const CloseAlert = styled.div`
  padding: 0.5rem;
  position: absolute;
  right: 0.5rem;
  top: 0.5rem;
  cursor: pointer;
  transition: opacity 200ms ease-in-out;

  :hover {
    opacity: 0.8;
  }
`;

const StyledIcon = styled(Icon)`
  width: 1.2rem;
  fill: inherit;
`;

export interface AlertProps {
  id: number;
  className?: string;
  onClose?: () => void;
  type: AlertTypes;
}

export const Alert: FC<AlertProps> = ({ className, onClose, children, id, type, ...props }) => {
  const dispatch = useAppDispatch();
  const closeAlert = () => dispatch(AlertsActions.closeAlert({ alertId: id }));

  const closeButton = (
    <CloseAlert onClick={closeAlert}>
      <StyledIcon Component={CloseIcon} />
    </CloseAlert>
  );

  return (
    <StyledAlert className={className} id={`alert-${id}`} type={type} {...props}>
      {closeButton}
      {children}
    </StyledAlert>
  );
};
