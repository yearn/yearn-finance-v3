import styled from 'styled-components';

import { Button, Icon, WarningFilledIcon } from '@components/common';

const ActionButtonsContainer = styled.div<{ actions: number }>`
  display: flex;
  align-items: center;
  // grid-template-columns: repeat(${({ actions }) => actions}, 1fr);
  gap: ${({ theme }) => theme.layoutPadding};
`;

const AlertIcon = styled(Icon)`
  width: 1.6rem;
  fill: ${({ theme }) => theme.colors.vaultActionButton.selected.borderColor};
`;

const AlertButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.8rem;
  border: 2px solid ${({ theme }) => theme.colors.vaultActionButton.selected.borderColor};
  background: ${({ theme }) => theme.colors.vaultActionButton.borderColor};
  width: 2.8rem;
  height: 2.8rem;
`;

const ActionButton = styled(Button)<{ hide?: boolean }>`
  background: ${({ theme }) => theme.colors.vaultActionButton.background};
  color: ${({ theme }) => theme.colors.vaultActionButton.color};
  border: 2px solid ${({ theme }) => theme.colors.vaultActionButton.borderColor};
  padding: 0 1.6rem;
  width: 9.6rem;

  ${({ hide }) => hide && `visibility: hidden;`}

  &[disabled],
  &.disabled {
    filter: contrast(${({ theme }) => theme.colors.vaultActionButton.disabledContrast});
  }
`;

interface ActionButtonsProps {
  actions: Array<{
    name: string;
    handler: () => void;
    disabled?: boolean;
    hide?: boolean;
  }>;
  alert?: string;
}

export const ActionButtons = ({ actions, alert }: ActionButtonsProps) => (
  <ActionButtonsContainer actions={actions.length}>
    {alert && (
      <AlertButton
        title={alert}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <AlertIcon Component={WarningFilledIcon} />
      </AlertButton>
    )}

    {actions.map(({ name, handler, disabled, hide, ...props }) => (
      <ActionButton
        className="action-button"
        data-testid={`action-${name.toLowerCase()}`}
        key={`action-${name}`}
        onClick={(e: Event) => {
          e.stopPropagation();
          handler();
        }}
        disabled={disabled}
        hide={hide}
        {...props}
      >
        {name}
      </ActionButton>
    ))}
  </ActionButtonsContainer>
);
