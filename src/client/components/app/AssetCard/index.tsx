import styled from 'styled-components';

import { Card, Box, Text } from '@components/common';

const StyledCard = styled(Card)`
  width: 100%;
  margin-bottom: 16px;
`;

interface AssetCardProps {
  icon: string;
  name: string;
  balance: string;
  earning: string;
  onClick: () => void;
}

export const AssetCard = ({ icon, name, balance, earning, onClick }: AssetCardProps) => {
  return (
    <StyledCard display="flex" flexDirection="row" justifyContent="space-between" alignItems="center" onClick={onClick}>
      <Box display="flex" flexDirection="row" alignItems="center">
        <img src={icon} alt={name} width="36" height="36" />
        <Text ml={11}>{name}</Text>
      </Box>
      <Text>{balance}</Text>
      <Text>{earning}</Text>
    </StyledCard>
  );
};
