import { ReactNode } from 'react';
import styled from 'styled-components';

import { Card, CardHeader, CardContent, CardElement } from '@components/common';

const StyledCardElement = styled(CardElement)<{ stripes?: boolean }>`
  display: flex;
  justify-content: center;
  margin: 0;
  padding: 0.6rem ${({ theme }) => theme.cardPadding};
  font-size: 1.4rem;
  flex-shrink: 0;

  > * {
    margin-top: 0;
    font-size: inherit;
    color: inherit;
  }

  ${({ stripes, theme }) =>
    stripes &&
    `
    &:nth-child(even) {
      background-color: ${theme.colors.surfaceVariantA};
    }
  `}
`;

const TitleCardElement = styled(CardElement)`
  display: flex;
  justify-content: center;
  margin: 0;
  padding: 0.6rem ${({ theme }) => theme.cardPadding};
  flex-shrink: 0;
`;

const StyledCardContent = styled(CardContent)<{ wrap?: boolean; pointer?: boolean }>`
  // display: grid;
  // grid-template-columns: 6rem 16.8rem 16.8rem 16.8rem 16.8rem 1fr; */
  align-items: stretch;
  justify-content: stretch;
  ${({ pointer }) => pointer && `cursor: pointer;`};
  ${({ wrap }) => wrap && `flex-wrap: wrap;`};

  &:hover {
    background-color: ${({ theme }) => theme.colors.selectionBar};

    ${StyledCardElement} {
      color: ${({ theme }) => theme.colors.onSurfaceH2Hover};
    }
    .action-button {
      background: ${({ theme }) => theme.colors.vaultActionButton.selected.background};
      color: ${({ theme }) => theme.colors.vaultActionButton.selected.color};
      border: 2px solid ${({ theme }) => theme.colors.vaultActionButton.selected.borderColor};
    }
  }
`;

const StyledCardHeader = styled(CardHeader)`
  margin-bottom: 0.6rem;
`;

const StyledCard = styled(Card)`
  padding: ${({ theme }) => theme.cardPadding} 0;
  width: 100%;
`;

interface Metadata {
  key: string;
  header?: string;
  align?: 'flex-start' | 'center' | 'flex-end';
  fontWeight?: number;
  width?: string;
  grow?: '1' | '0';
  hide?: boolean;
  className?: string;
  transform?: (data: Data) => ReactNode;
}

interface Data {
  [key: string]: any;
}

interface DetailCardProps {
  header: string;
  metadata: Metadata[];
  data: Data[];
  stripes?: boolean;
  wrap?: boolean;
  SearchBar?: ReactNode;
}

export const DetailCard = ({ header, metadata, data, stripes, wrap, SearchBar, ...props }: DetailCardProps) => {
  if (data.length === 0 && !SearchBar) {
    return null;
  }

  return (
    <StyledCard {...props}>
      <StyledCardHeader header={header} />
      {SearchBar}

      <CardContent>
        {metadata.map(
          ({ key, header, width, align, grow, hide, className }) =>
            !hide && (
              <TitleCardElement
                className={className}
                key={key}
                header={header}
                width={width}
                align={align}
                grow={grow}
              />
            )
        )}
      </CardContent>

      {data.map((item, i) => (
        <StyledCardContent key={`content-${i}`} wrap={wrap} pointer={!!item.onClick} onClick={item.onClick}>
          {metadata.map(
            ({ key, width, align, grow, hide, fontWeight, className, transform }) =>
              !hide && (
                <StyledCardElement
                  key={`element-${key}-${i}`}
                  content={transform ? undefined : item[key]}
                  fontWeight={fontWeight}
                  width={width}
                  align={align}
                  grow={grow}
                  stripes={stripes}
                  className={className}
                >
                  {transform && transform(item)}
                </StyledCardElement>
              )
          )}
        </StyledCardContent>
      ))}
    </StyledCard>
  );
};
