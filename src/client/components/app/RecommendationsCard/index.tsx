import styled from 'styled-components';

import { Card, CardHeader, CardContent, Text, Icon, ChevronRightIcon } from '@components/common';
import { TokenIcon } from '@components/app';

const ContainerCard = styled(Card)`
  padding: ${({ theme }) => theme.card.padding} 0;
  width: 100%;
  min-width: 56%;
  border-radius: 0.2rem;
`;

const StyledCardContent = styled(CardContent)`
  align-items: stretch;
  justify-content: center;
  flex-wrap: wrap;
  grid-gap: ${({ theme }) => theme.card.padding};
  margin-top: ${({ theme }) => theme.card.padding};
  padding: 0 ${({ theme }) => theme.card.padding};
`;

const ItemCard = styled(Card)<{ onClick: any }>`
  display: flex;
  align-items: center;
  min-width: 21rem;
  flex: 1;
  padding: ${({ theme }) => theme.layoutPadding};
  background-color: ${({ theme }) => theme.colors.background};
  position: relative;
  transition: filter 200ms ease-in-out;

  ${({ onClick, theme }) =>
    onClick &&
    `
    cursor: pointer;
    &:hover {
      filter: brightness(85%);
      ${TokenListIcon} {
        color: ${theme.colors.primary};
      }
    }
  `};
`;

const ItemHeader = styled(Text)`
  position: absolute;
  font-size: 1.4rem;
`;

const ItemInfo = styled(Text)`
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ItemInfoLabel = styled(Text)`
  color: ${({ theme }) => theme.colors.titles};
  margin-top: 0.8rem;
  font-weight: 700;
  font-size: 2.4rem;
`;

const ItemName = styled(Text)`
  color: ${({ theme }) => theme.colors.icons.variant};
  font-size: 1.6rem;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
`;

const TokenListIcon = styled(Icon)`
  position: absolute;
  right: 3rem;
  fill: currentColor;
  width: 1rem;
  transition: color 200ms ease-in-out;
`;

const CenterIcon = styled.div`
  display: flex;
  margin-right: ${({ theme }) => theme.layoutPadding};
  user-select: none;
`;

interface Item {
  header?: string;
  icon: string;
  name: string;
  info: string;
  infoDetail?: string;
  action?: string;
  onAction?: () => void;
}

interface RecommendationsProps {
  header?: string;
  subHeader?: string;
  items: Item[];
}

export const RecommendationsCard = ({ header, subHeader, items, ...props }: RecommendationsProps) => {
  if (items.length === 0) {
    return null;
  }

  return (
    <ContainerCard {...props}>
      <CardHeader header={header} subHeader={subHeader} />

      <StyledCardContent>
        {items.map((item, i) => (
          <ItemCard key={`${i}-${item.name}`} variant="primary" onClick={item.onAction ? item.onAction : undefined}>
            {item.header && <ItemHeader>{item.header}</ItemHeader>}

            <CenterIcon>
              <TokenIcon symbol={item.name} icon={item.icon} size="xBig" />
            </CenterIcon>

            <ItemInfo>
              <ItemName>{item.name}</ItemName>
              <ItemInfoLabel>{item.info}</ItemInfoLabel>
            </ItemInfo>

            {item.onAction && <TokenListIcon Component={ChevronRightIcon} />}
          </ItemCard>
        ))}
      </StyledCardContent>
    </ContainerCard>
  );
};
