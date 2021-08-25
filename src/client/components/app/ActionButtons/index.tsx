import styled from 'styled-components';

import { Button } from '@components/common';

const ActionButtonsContainer = styled.div<{ actions: number }>`
  display: flex;
  align-items: center;
  // grid-template-columns: repeat(${({ actions }) => actions}, 1fr);
  gap: ${({ theme }) => theme.cardPadding};
`;

const AlertButton = styled.div`
  border-radius: 2px;
  background: black;
  width: 2rem;
  height: 2rem;
`;

const ActionButton = styled(Button)`
  background: ${({ theme }) => theme.colors.vaultActionButton.background};
  color: ${({ theme }) => theme.colors.vaultActionButton.color};
  border: 2px solid ${({ theme }) => theme.colors.vaultActionButton.borderColor};
  padding: 0 1.6rem;
  width: 9.6rem;
`;

interface ActionButtonsProps {
  actions: Array<{
    name: string;
    handler: () => void;
    disabled?: boolean;
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
      />
    )}

    {actions.map(({ name, handler, disabled }) => (
      <ActionButton
        className="action-button"
        key={`action-${name}`}
        onClick={(e: Event) => {
          e.stopPropagation();
          handler();
        }}
        disabled={disabled}
      >
        {name}
      </ActionButton>
    ))}
  </ActionButtonsContainer>
);
