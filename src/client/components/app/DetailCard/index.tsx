import { useState, ReactNode } from 'react';
import styled from 'styled-components';
import { reverse, some, get, toNumber, isString, orderBy } from 'lodash';

import { Card, CardHeader, CardContent, CardElement } from '@components/common';
import { useEffect } from 'react';

function isNumber(n: any) {
  return typeof n != 'boolean' && !isNaN(n);
}

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

interface Metadata<T> {
  key: Extract<keyof T, string>;
  header?: string;
  align?: 'flex-start' | 'center' | 'flex-end';
  fontWeight?: number;
  width?: string;
  grow?: '1' | '0';
  hide?: boolean;
  className?: string;
  sortable?: boolean;
  format?: (item: T) => string;
  transform?: (item: T) => ReactNode;
}

interface DetailCardProps<T> {
  header: string;
  metadata: Metadata<T>[];
  data: T[];
  stripes?: boolean;
  wrap?: boolean;
  SearchBar?: ReactNode;
  onAction?: (item: T) => void;
}

export const DetailCard = <T,>({
  header,
  metadata,
  data,
  stripes,
  wrap,
  SearchBar,
  onAction,
  ...props
}: DetailCardProps<T>) => {
  const [sortedBy, setSortedBy] = useState('');
  const [sortedData, setSortedData] = useState(data);

  useEffect(() => {
    setSortedData(data);
  }, [data]);

  if (data.length === 0 && !SearchBar) {
    return null;
  }

  const sort = (key: string) => {
    if (sortedBy === key) {
      setSortedData(reverse([...sortedData]));
    } else {
      if (some(sortedData, key)) {
        setSortedBy(key);
        const sortedDataDesc = orderBy(
          [...sortedData],
          (item) => {
            const element = get(item, key);
            if (isNumber(element)) {
              return toNumber(element);
            }
            if (isString(element)) {
              return element.toLowerCase();
            }

            return element;
          },
          ['desc']
        );
        setSortedData(sortedDataDesc);
      }
    }
  };

  return (
    <StyledCard {...props}>
      <StyledCardHeader header={header} />
      {SearchBar}

      <CardContent>
        {metadata.map(
          ({ key, header, width, align, grow, sortable, hide, className }) =>
            !hide && (
              <TitleCardElement
                className={className}
                key={key}
                header={header}
                width={width}
                align={align}
                grow={grow}
                onClick={() => (sortable ? sort(key) : undefined)}
                pointer={sortable}
              />
            )
        )}
      </CardContent>

      {sortedData.map((item, i) => (
        <StyledCardContent
          key={`content-${i}`}
          wrap={wrap}
          pointer={!!onAction}
          onClick={() => {
            if (onAction) onAction(item);
          }}
        >
          {metadata.map(
            ({ key, width, align, grow, hide, fontWeight, className, format, transform }) =>
              !hide && (
                <StyledCardElement
                  key={`element-${key}-${i}`}
                  content={transform ? undefined : format ? format(item) : item[key]}
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
