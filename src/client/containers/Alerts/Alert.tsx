import { FC } from 'react';
import styled from 'styled-components';

import { useAppDispatch } from '@hooks';
import { AlertsActions } from '@store';
import { Box, Icon, CloseIcon, WarningIcon } from '@components/common';
import { AlertTypes } from '@types';

const StyledAlert = styled.div<{ type: AlertTypes }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  overflow: hidden;
  overflow-y: auto;
  padding: 1.2rem 3.2rem 1.2rem 1.6rem;
  position: relative;
  pointer-events: all;
  z-index: 1;
  width: 28rem;
  max-width: 100%;
  max-height: 100%;
  position: relative;
  box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.16);
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
  padding: 1rem;
  position: absolute;
  right: 0rem;
  top: 0rem;
  cursor: pointer;
  transition: opacity 200ms ease-in-out;

  :hover {
    opacity: 0.8;
  }
`;

const StyledIcon = styled(Icon)`
  fill: inherit;
`;

export interface AlertProps {
  id: string;
  className?: string;
  onClose?: () => void;
  type: AlertTypes;
}

export const Alert: FC<AlertProps> = ({ className, onClose, children, id, type, ...props }) => {
  const dispatch = useAppDispatch();
  const closeAlert = () => dispatch(AlertsActions.closeAlert({ alertId: id }));

  const closeButton = (
    <CloseAlert onClick={closeAlert}>
      <StyledIcon Component={CloseIcon} height="1rem" width="1rem" />
    </CloseAlert>
  );

  return (
    <StyledAlert className={className} id={`alert-${id}`} type={type} {...props}>
      {type === 'warning' && (
        <Box height={22} width={22}>
          <StyledIcon Component={WarningIcon} size="2.2rem" />
        </Box>
      )}
      {closeButton}
      <Box ml="1.6rem">{children}</Box>
    </StyledAlert>
  );
};
