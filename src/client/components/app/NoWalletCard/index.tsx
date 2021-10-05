import styled from 'styled-components';

import { Card, Icon, Text, WalletMissingIcon } from '@components/common';

const StyledIcon = styled(Icon)`
  width: 6.4rem;
`;

const StyledText = styled(Text)`
  font-size: 1.8rem;
  font-weight: bold;
`;

const StyledCard = styled(Card)`
  display: flex;
  align-items: center;
  gap: 5rem;
  padding: ${({ theme }) => theme.card.padding} 5rem;
`;

interface NoWalletCardProps {}

export const NoWalletCard = ({ ...props }: NoWalletCardProps) => {
  return (
    <StyledCard cardSize="small" {...props}>
      <StyledIcon Component={WalletMissingIcon} />
      <StyledText>Wallet not connected</StyledText>
    </StyledCard>
  );
};
