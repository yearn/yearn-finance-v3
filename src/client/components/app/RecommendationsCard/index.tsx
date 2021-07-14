import styled from 'styled-components';

import { Card, CardHeader, CardContent, Text, Icon, ChevronRightIcon } from '@components/common';
import { TokenIcon } from '@components/app';

const ContainerCard = styled(Card)`
  padding: ${({ theme }) => theme.cardPadding} 0;
  width: 100%;
`;

const StyledCardContent = styled(CardContent)`
  align-items: stretch;
  justify-content: center;
  flex-wrap: wrap;
  grid-gap: ${({ theme }) => theme.cardPadding};
  margin-top: ${({ theme }) => theme.cardPadding};
  padding: 0 ${({ theme }) => theme.cardPadding};
`;

const ItemCard = styled(Card)<{ onClick: any }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 18rem;
  min-width: 15rem;
  flex: 1;
  padding: 0.8rem;
  background-color: ${({ theme }) => theme.colors.background};
  transition: filter 200ms ease-in-out;

  ${({ onClick }) =>
    onClick &&
    `
    cursor: pointer;
    &:hover {
      filter: brightness(85%);
    }
  `};
`;

const ItemHeader = styled(Text)`
  font-size: 1.4rem;
`;

const ItemInfo = styled(Text)`
  color: ${({ theme }) => theme.colors.onSurfaceH2};
  font-size: 2.4rem;
  font-weight: 600;
  padding-bottom: 0.4rem;
  margin-top: 2.3rem;
`;

const ItemName = styled(Text)`
  color: ${({ theme }) => theme.colors.onSurfaceH2};
  font-size: 1.4rem;
  font-weight: 600;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 0.4rem;
  text-align: center;
  flex: 1;
`;

const TokenListIcon = styled(Icon)`
  position: absolute;
  right: 0;
  fill: currentColor;
`;

const CenterIcon = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 3.4rem;
  width: 100%;
  text-align: center;
  position: relative;
`;

interface Item {
  header: string;
  icon: string;
  name: string;
  info: string;
  infoDetail?: string;
  action?: string;
  onAction?: () => void;
}

interface RecommendationsProps {
  header: string;
  items: Item[];
}

export const RecommendationsCard = ({ header, items, ...props }: RecommendationsProps) => {
  if (items.length === 0) {
    return null;
  }

  return (
    <ContainerCard {...props}>
      <CardHeader header={header} />

      <StyledCardContent>
        {items.map((item, i) => (
          <ItemCard key={`${i}-${item.name}`} variant="primary" onClick={item.onAction ? item.onAction : undefined}>
            <ItemHeader>{item.header}</ItemHeader>

            <CenterIcon>
              <TokenIcon symbol={item.name} icon={item.icon} size="big" />
              {item.onAction && <TokenListIcon Component={ChevronRightIcon} />}
            </CenterIcon>

            <ItemName>{item.name}</ItemName>

            <ItemInfo>{item.info}</ItemInfo>
          </ItemCard>
        ))}
      </StyledCardContent>
    </ContainerCard>
  );
};
