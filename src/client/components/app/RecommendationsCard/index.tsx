import styled from 'styled-components';

import { normalizeAmount, numberWithCommas, prettyNumbers, formatAddress, getDate } from '@utils';
import { Card, CardHeader, CardContent, Text, Icon, ChevronRightIcon } from '@components/common';
import { TokenIcon } from '@components/app';
import { useAppTranslation } from '@hooks';

const TokenListIconSize = '1rem';

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
  min-height: 30rem;
  min-width: 33%;
  flex: 1;
  padding: ${({ theme }) => theme.layoutPadding};
  padding-right: calc(${({ theme }) => theme.card.padding} + ${TokenListIconSize} * 2.5);
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
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ItemName = styled(Text)`
  color: ${({ theme }) => theme.colors.icons.variant};
  font-size: 3rem;
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
  width: ${TokenListIconSize};
  transition: color 200ms ease-in-out;
`;

const TopIcon = styled.div`
  margin-bottom: 10rem;
  margin-right: 3rem;
  user-select: none;
`;

const Divider = styled.div`
  height: ${({ theme }) => theme.spacing.md};
`;

const MetricsTextContainer = styled.div`
  display: flex;
  flex-direction: space-between;
`;

const Metric = styled.span`
  font-weight: bold;
  font-size: 3rem;
`;

const MetricsText = styled.span`
  font-size: 1.6rem;
`;

interface Item {
  header?: string;
  id: string;
  icon: string;
  name: string;
  info: string;
  principal: any;
  deposit: any;
  collateral: string;
  revenue: string;
  tags?: string[];
  start: number;
  end: number;
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
  const { t } = useAppTranslation(['common']);

  if (items.length === 0) {
    return null;
  }
  // todo handle loading of principal/deposit vals with spinner or something
  return (
    <ContainerCard {...props}>
      <CardHeader header={header} subHeader={subHeader} />

      <StyledCardContent>
        {items.map((item, i) => (
          <ItemCard key={`${i}-${item.name}`} variant="primary" onClick={item.onAction ? item.onAction : undefined}>
            {item.header && <ItemHeader>{item.header}</ItemHeader>}

            <TopIcon>
              <TokenIcon symbol={item.name} icon={item.icon} size="xxBig" />
            </TopIcon>

            <ItemInfo>
              <ItemName>
                {' '}
                {t('components.line-card.borrower')}: {formatAddress(item.name)}
              </ItemName>
              <Divider />
              <ItemName>
                {' '}
                {t('components.line-card.line')}: {formatAddress(item.id)}
              </ItemName>
              <Divider />
              <ItemName>
                {' '}
                <Metric>{t('components.line-card.start')}: </Metric>
                <MetricsText>{getDate(item.start)}</MetricsText>
              </ItemName>
              <Divider />
              <ItemName>
                {' '}
                <Metric>{t('components.line-card.end')}: </Metric>
                <MetricsText>{getDate(item.end)}</MetricsText>
              </ItemName>
              <Divider />
              <Metric>
                ${prettyNumbers(item.revenue)} / ${prettyNumbers(item.deposit)}
              </Metric>
              <MetricsTextContainer>
                <MetricsText>
                  {' '}
                  {t('components.line-card.total-debt')} / {t('components.line-card.total-credit')}{' '}
                </MetricsText>
              </MetricsTextContainer>
              <Divider />

              <ItemInfoLabel>{t('components.line-card.secured-by')}:</ItemInfoLabel>
              <Metric>
                ${prettyNumbers(item.collateral)} / ${prettyNumbers(item.revenue)}
              </Metric>
              <MetricsTextContainer>
                <MetricsText>
                  {' '}
                  {t('components.line-card.collateral')} / {t('components.line-card.revenue')}{' '}
                </MetricsText>
              </MetricsTextContainer>
            </ItemInfo>
            {item.onAction && <TokenListIcon Component={ChevronRightIcon} />}
          </ItemCard>
        ))}
      </StyledCardContent>
    </ContainerCard>
  );
};
