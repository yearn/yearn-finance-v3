import styled from 'styled-components';

import { Card, Box, Text } from '@components/common';

const StyledCard = styled(Card)<{ className: string }>`
  display: grid;
  grid-template-columns: var(--vaults-columns);
  width: 100%;
  margin-bottom: 16px;
  background-color: ${({ theme }) => theme.colors.surface};
  padding-left: var(--vaults-padding);
  padding-right: var(--vaults-padding);
  cursor: ${(props) => (props.onClick ? 'pointer' : 'default')};

  &.selected {
    background-color: ${({ theme }) => theme.colors.onSurfaceVariantA};
  }
`;

interface AssetCardProps {
  icon: string;
  name: string;
  balance: string;
  earning: string;
  selected?: boolean;
  onClick: () => void;
}

export const AssetCard = ({ icon, name, balance, earning, selected, onClick }: AssetCardProps) => {
  return (
    <StyledCard
      className={selected ? 'selected' : ''}
      display="flex"
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
      onClick={onClick}
    >
      <Box display="flex" flexDirection="row" alignItems="center">
        <img src={icon} alt={name} width="36" height="36" />
        <Text ml={11}>{name}</Text>
      </Box>
      <Text>{balance}</Text>
      <Text>{earning}</Text>
    </StyledCard>
  );
};
