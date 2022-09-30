import styled from 'styled-components';

import { FlatCard, FlatCardHeader, FlatCardContent, Text, Icon, ChevronRightIcon } from '@components/common';
import { TokenIcon } from '@components/app';
import { device } from '@src/client/themes/default';
import { useAppTranslation } from '@hooks';

const TokenListIconSize = '1rem';

const ContainerCard = styled(FlatCard)`
  padding: ${({ theme }) => theme.card.padding} 0;
  width: 100%;
  min-width: 20vw;
  height: 100%;
`;

const StyledCardContent = styled(FlatCardContent)`
  align-items: stretch;
  justify-content: center;
  flex-wrap: wrap;
  grid-gap: ${({ theme }) => theme.card.padding};
  margin-top: ${({ theme }) => theme.card.padding};
  padding: 0 ${({ theme }) => theme.card.padding};
`;

const ItemCard = styled(FlatCard)<{ onClick: any }>`
  max-width: 33vw;
  transition: filter 200ms ease-in-out;

  @media (${device.tablet}) {
    max-width: 100%;
    min-height: 250px;
  }
  ${({ onClick, theme }) => `
    box-shadow: 0px 4px 10px 2px rgba(0, 0, 0, 0.5);
    background: ${theme.colors.background};
    color: ${theme.colors.primary};

    ${
      onClick &&
      `
      cursor: pointer;
      &:hover {
        filter: brightness(85%);
        ${TokenListIcon} {
          color: ${theme.colors.primary};
        }
      }`
    }
  `}
`;

const ItemHeader = styled(Text)`
  position: absolute;
  font-size: ${({ theme }) => theme.fonts.sizes.md};
  font-weight: 800; // 400 when on LS-VG5000 font
`;

const BorrowerInfo = styled(Text)`
  ${({ theme }) => theme.fonts.styles.body};
  display: flex;
  flex-direction: row;
  overflow: hidden;
`;

const BorrowerDescription = styled(Text)`
  ${({ theme }) => theme.fonts.styles.body};
  color: ${({ theme }) => theme.colors.titles};
  margin-top: 0.8rem;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const LineBorrowerName = styled(Text)`
  ${({ theme }) => theme.fonts.styles.cardHeader};
  color: ${({ theme }) => theme.colors.titles};
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

const BorrowerIcon = styled.div`
  margin-right: ${({ theme }) => theme.spacing.md};
`;

const BorrowerData = styled.div`
  display: flex;
  flex-direction: column;
  grid-template-column: 1fr;
`;

const CollateralTitle = styled.h3`
  ${({ theme }) => theme.fonts.styles.cardHeader};
  margin: ${({ theme }) => theme.spacing.md} 0;
  color: ${({ theme }) => theme.colors.titles};
`;

const CollateralData = styled.div`
  display: grid;
  flex-direction: row;
  justify-content: space-around;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: ${({ theme }) => theme.spacing.md};
`;

const TagContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  height: 3rem;
`;

const ItemTag = styled(BorrowerDescription)`
  border-radius: 10%;
  // background-color: ${({ theme }) => theme.colors.backgroundVariant};
  margin-right: ${({ theme }) => theme.spacing.sm};
  user-select: none;
`;
const ItemConjuctior = styled.span`
  margin-left: ${({ theme }) => theme.spacing.sm};
`;

interface Item {
  header?: string;
  icon: string;
  name: string;
  info: string;
  principal: string | number | Promise<number>;
  deposit: string | number | Promise<number>;
  tags?: string[];
  infoDetail?: string;
  action?: string;
  onAction?: () => void;
}

interface RecommendationsProps {
  header?: string;
  subHeader?: string;
  items: Item[];
  // line: BasicLineData
}

export const LineCard = ({ header, subHeader, items, ...props }: RecommendationsProps) => {
  const { t } = useAppTranslation(['common']);

  if (items.length === 0) {
    return null;
  }

  return (
    <ContainerCard {...props}>
      <FlatCardHeader header={header} subHeader={subHeader} />

      <FlatCardContent>
        {items.map((item, i) => (
          <ItemCard key={`${i}-${item.name}`} variant="primary" onClick={item.onAction ? item.onAction : undefined}>
            {item.header && <ItemHeader>{item.header}</ItemHeader>}

            <BorrowerInfo>
              {!item.icon ? null : (
                <BorrowerIcon>
                  {' '}
                  <TokenIcon symbol={item.name} icon={item.icon} size="xBig" />
                </BorrowerIcon>
              )}
              <BorrowerData>
                <LineBorrowerName ellipsis>
                  {t('components.line-card.borrower')}: {item.name}
                </LineBorrowerName>
                <TagContainer>
                  <ItemTag>{t('components.line-card.secured-by')}:</ItemTag>
                  {item.tags?.map((tag, i) => (
                    <ItemTag>
                      {tag} {item.tags?.[i + 1] ? <ItemConjuctior>+</ItemConjuctior> : ''}
                    </ItemTag>
                  ))}
                </TagContainer>
                <BorrowerDescription>
                  {t('components.line-card.total-debt')}: ${item.principal}
                </BorrowerDescription>
                {/* {item.tags?.map((t) => (
                  <BorrowerDescription>{t}</BorrowerDescription>
                ))} */}
              </BorrowerData>
            </BorrowerInfo>
            {/* TODO enable below when aggregate data added to type CreditLine */}
            {/* <CollateralTitle>{t('components.line-card.secured-by')}:</CollateralTitle> */}
            <CollateralData>
              {/* <BorrowerDescription>{item.name}</BorrowerDescription>
              <BorrowerDescription>{item.name}</BorrowerDescription>
              <BorrowerDescription>{item.name}</BorrowerDescription>
              <BorrowerDescription>{item.name}</BorrowerDescription> */}
            </CollateralData>

            {/* adds arrow on cards when hovered */}
            {/* {item.onAction && <TokenListIcon Component={ChevronRightIcon} />} */}
          </ItemCard>
        ))}
      </FlatCardContent>
    </ContainerCard>
  );
};
