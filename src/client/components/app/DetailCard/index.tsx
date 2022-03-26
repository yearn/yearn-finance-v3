import { useState, useEffect, ReactNode } from 'react';
import styled from 'styled-components';

import { Card, CardHeader, CardContent, CardElement, CardEmptyList, ToggleButton } from '@components/common';
import { sort } from '@utils';

const StyledCardElement = styled(CardElement)<{ stripes?: boolean }>`
  display: flex;
  justify-content: center;
  margin: 0;
  padding: calc(${({ theme }) => theme.card.padding} / 4) calc(${({ theme }) => theme.layoutPadding} / 2);
  font-size: 1.4rem;
  flex-shrink: 0;

  &:first-child {
    padding-left: ${({ theme }) => theme.card.padding};
  }
  &:last-child {
    padding-right: ${({ theme }) => theme.card.padding};
  }

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
  padding: 0.6rem calc(${({ theme }) => theme.layoutPadding} / 2);
  flex-shrink: 0;
  user-select: none;

  &:first-child {
    padding-left: ${({ theme }) => theme.card.padding};
  }
  &:last-child {
    padding-right: ${({ theme }) => theme.card.padding};
  }
`;

const StyledCardContent = styled(CardContent)<{ wrap?: boolean; pointer?: boolean }>`
  align-items: stretch;
  justify-content: stretch;
  ${({ pointer }) => pointer && `cursor: pointer;`};
  ${({ wrap }) => wrap && `flex-wrap: wrap;`};

  ${TitleCardElement} {
    background: red;
  }

  &:hover {
    background-color: ${({ theme }) => theme.colors.selectionBar};

    // ${StyledCardElement} {
    //   color: ${({ theme }) => theme.colors.titles};
    // }
    // .action-button {
    //   background: ${({ theme }) => theme.colors.vaultActionButton.selected.background};
    //   color: ${({ theme }) => theme.colors.vaultActionButton.selected.color};
    //   border: 2px solid ${({ theme }) => theme.colors.vaultActionButton.selected.borderColor};
    // }
  }
`;

const StyledCardHeader = styled(CardHeader)`
  display: flex;
  flex-wrap: center;
  justify-content: space-between;
  margin-bottom: 0.6rem;
`;

const StyledCard = styled(Card)`
  padding: ${({ theme }) => theme.card.padding} 0;
  width: 100%;
`;

const SectionContent = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.2rem;
  align-items: center;
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
  filterLabel?: string;
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
  filterLabel,
  ...props
}: DetailCardProps<T>) => {
  const [sortedData, setSortedData] = useState(initialSortBy ? sort(data, initialSortBy) : data);
  const [sortedBy, setSortedBy] = useState(initialSortBy);
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [filterToggle, setFilterToggle] = useState(filterBy ? false : true);
  const filteredData = filterBy ? sortedData.filter(filterBy) : sortedData;
  const displayData = filterToggle ? sortedData : filteredData;

  const handleSort = (key: Extract<keyof T, string>) => {
    if (sortedBy === key) {
      setSortedData([...sortedData].reverse());
      setOrder(order === 'desc' ? 'asc' : 'desc');
    } else {
      setSortedData(sort(sortedData, key));
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
      <StyledCardHeader header={header}>
        {!!filterBy && (
          <SectionContent>
            {filterLabel}
            <ToggleButton selected={filterToggle} setSelected={setFilterToggle} />
          </SectionContent>
        )}
      </StyledCardHeader>
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
          data-testid="list-item"
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
