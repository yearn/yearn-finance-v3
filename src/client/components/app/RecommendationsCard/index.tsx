import styled from 'styled-components';

import { Card, CardHeader, CardContent, CardElement, Text, Button } from '@components/common';

const ContainerCard = styled(Card)`
  max-width: max-content;
  padding: 1.2rem 1.2rem 0 0;
`;

const StyledCardContent = styled(CardContent)`
  justify-content: center;
`;

const ItemCard = styled(Card)`
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 25.6rem;
  width: 18rem;
  padding: 1.2rem 0;
  margin-bottom: 1.6rem;
`;

const ItemInfo = styled(Text)`
  color: ${({ theme }) => theme.colors.onSurfaceH2};
`;

const ItemName = styled(Text)`
  color: ${({ theme }) => theme.colors.onSurfaceH2};
  margin-top: 0.4rem;
  font-weight: 600;
`;

const ItemButton = styled(Button)`
  margin-top: 0.7rem;
  flex-shrink: 0;
  color: ${({ theme }) => theme.colors.onSurfaceH2};
  background-color: ${({ theme }) => theme.colors.background};

  &:hover {
    color: ${({ theme }) => theme.colors.onSurfaceH1};
    background-color: ${({ theme }) => theme.colors.secondaryVariantA};
  }
`;

const InnerBox = styled(Card)`
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 15.6rem;
  width: 15.6rem;
  padding: 1.2rem 0;
  margin-bottom: 1.6rem;
  background-color: ${({ theme }) => theme.colors.background};
`;

const CenterIcon = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 15.6rem;
`;

const Icon = styled.img`
  width: 3.6rem;
  height: 3.6rem;
`;

interface Item {
  header: string;
  icon: string;
  name: string;
  info: string;
  infoDetail?: string;
  action: string;
  onAction: () => void;
}

interface RecommendationsProps {
  header: string;
  items: Item[];
}

export const RecomendationsCard = ({ header, items }: RecommendationsProps) => {
  if (items.length === 0) {
    return null;
  }

  return (
    <ContainerCard>
      <CardHeader header={header} />
      <StyledCardContent wrap>
        {items.map((item, i) => (
          <CardElement key={`${i}-${item.name}`}>
            <ItemCard variant="primary">
              <InnerBox>
                {item.header}
                <CenterIcon>
                  <Icon alt={item.name} src={item.icon} />
                  <ItemName>{item.name}</ItemName>
                </CenterIcon>
              </InnerBox>
              <ItemInfo fontSize="2.4rem" fontWeight="600">
                {item.info}
              </ItemInfo>

              <ItemButton onClick={item.onAction}>{item.action}</ItemButton>
            </ItemCard>
          </CardElement>
        ))}
      </StyledCardContent>
    </ContainerCard>
  );
};
