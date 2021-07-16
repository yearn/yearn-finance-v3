import styled from 'styled-components';

import { Button } from '@components/common';

const ActionButtonsContainer = styled.div<{ actions: number }>`
  display: flex;
  align-items: center;
  // grid-template-columns: repeat(${({ actions }) => actions}, 1fr);
  gap: ${({ theme }) => theme.cardPadding};
`;

const ActionButton = styled(Button)`
  background: ${({ theme }) => theme.colors.vaultActionButton.background};
  color: ${({ theme }) => theme.colors.vaultActionButton.color};
  border: 2px solid ${({ theme }) => theme.colors.vaultActionButton.borderColor};
  padding: 0 1.6rem;
`;

interface ActionButtonsProps {
  actions: Array<{
    name: string;
    handler: () => void;
    disabled?: boolean;
  }>;
}

export const ActionButtons = ({ actions }: ActionButtonsProps) => (
  <ActionButtonsContainer actions={actions.length}>
    {actions.map(({ name, handler, disabled }) => (
      <ActionButton key={`action-${name}`} onClick={handler} disabled={disabled}>
        {name}
      </ActionButton>
    ))}
  </ActionButtonsContainer>
);
