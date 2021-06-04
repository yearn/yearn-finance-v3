import styled from 'styled-components';

import { Box, Button } from '@components/common';

const ActionButton = styled(Button)`
  background: ${({ theme }) => theme.colors.vaultActionButton.background};
  color: ${({ theme }) => theme.colors.vaultActionButton.color};
  border: 2px solid ${({ theme }) => theme.colors.vaultActionButton.borderColor};
  padding: 0 1.6rem;
  margin-left: 1.2rem;
`;

interface ActionButtonsProps {
  actions: Array<{
    name: string;
    handler: () => void;
    disabled?: boolean;
  }>;
}

export const ActionButtons = ({ actions }: ActionButtonsProps) => (
  <Box display="grid" gridTemplateColumns={`repeat(${actions.length}, 1fr)`} flexDirection="row" alignItems="center">
    {actions.map(({ name, handler, disabled }) => (
      <ActionButton key={`action-${name}`} onClick={handler} disabled={disabled}>
        {name}
      </ActionButton>
    ))}
  </Box>
);
