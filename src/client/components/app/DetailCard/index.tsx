import { useState, useEffect, ReactNode } from 'react';
import styled from 'styled-components';

import { Card, CardHeader, CardContent, CardElement, CardEmptyList, ToggleButton } from '@components/common';
import { sort } from '@utils';
import { filter } from 'lodash';

const StyledCardElement = styled(CardElement)<{ stripes?: boolean }>`
  display: flex;
  justify-content: center;
  margin: 0;
  padding: 0.6rem ${({ theme }) => theme.card.padding};
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
  margin: 0;
  padding: 0.6rem ${({ theme }) => theme.card.padding};
  flex-shrink: 0;
  user-select: none;
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
  padding: ${({ theme }) => theme.card.padding} 0;
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
  initialSortBy?: Extract<keyof T, string>;
  SearchBar?: ReactNode;
  searching?: boolean;
  onAction?: (item: T) => void;
  filterBy?: (item: T) => boolean;
}

export const DetailCard = <T,>({
  header,
  metadata,
  data,
  stripes,
  wrap,
  initialSortBy,
  SearchBar,
  searching,
  onAction,
  filterBy,
  ...props
}: DetailCardProps<T>) => {
  const [sortedData, setSortedData] = useState(initialSortBy ? sort(data, initialSortBy) : data);
  const [sortedBy, setSortedBy] = useState(initialSortBy);
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const filteredData = filterBy ? sortedData.filter(filterBy) : sortedData;
  const displayData = filterBy ? filteredData : sortedData;

  const handleSort = (key: Extract<keyof T, string>) => {
    if (sortedBy === key) {
      setSortedData([...displayData].reverse());
      setOrder(order === 'desc' ? 'asc' : 'desc');
    } else {
      setSortedData(sort(displayData, key));
      setSortedBy(key);
      setOrder('desc');
    }
  };

  useEffect(() => {
    setSortedData(sortedBy ? sort(data, sortedBy, order) : data);
  }, [data]);

  if (data.length === 0 && !SearchBar) {
    return null;
  }

  return (
    <StyledCard {...props}>
      <StyledCardHeader header={header} />
      {SearchBar}

      {!!displayData.length && (
        <CardContent>
          {metadata.map(
            ({ key, sortable, hide, className, transform, format, ...rest }) =>
              !hide && (
                <TitleCardElement
                  className={className}
                  key={key}
                  onClick={() => (sortable ? handleSort(key) : undefined)}
                  sortable={sortable}
                  activeSort={sortedBy === key}
                  sortType={order}
                  {...rest}
                />
              )
          )}
        </CardContent>
      )}

      {displayData.map((item, i) => (
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

      {!displayData.length && <CardEmptyList searching={searching} />}
    </StyledCard>
  );
};
