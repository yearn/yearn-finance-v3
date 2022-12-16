import { useState, useEffect, ReactNode } from 'react';
import styled from 'styled-components';

import { Card, CardHeader, CardContent, CardElement, CardEmptyList, ToggleButton } from '@components/common';
import { sort } from '@utils';

const StyledCardElement = styled(CardElement)<{ stripes?: boolean }>`
  display: flex;
  justify-content: center;
  margin: 0;
  // NOTE Card element uses card padding and layout padding, also other card child components too, doing this
  // all the card components will work fine when modifying either of the paddings, since the paddings are
  // related between them
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

  &:hover {
    background-color: ${({ theme }) => theme.colors.selectionBar};

    // NOTE If you want to change other elements on selection bar hover
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
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  grid-gap: 1.2rem;
`;

const StyledFilters = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  margin-bottom: 2.4rem;
  grid-gap: 0.4rem;
  width: 100%;
  padding: 0 ${({ theme }) => theme.card.padding};
`;

const StyledFilterButton = styled.button<{ active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;
  font-size: 1.4rem;
  background: ${({ active, theme }) => (active ? theme.colors.primary : theme.colors.background)};
  color: ${({ active, theme }) => (active ? theme.colors.background : theme.colors.primary)};
  border: none;
  border-radius: 99rem;
  cursor: pointer;
  user-select: none;
  height: 2.4rem;
  min-width: 4.8rem;
  margin-top: 0.8rem;
  padding: 0 1.2rem;

  &:focus {
    outline: none;
  }

  &:hover {
    filter: contrast(90%);
  }
`;

const StyledCard = styled(Card)`
  padding: ${({ theme }) => theme.card.padding} 0;
  width: 100%;
`;

const SectionContent = styled.div`
  display: flex;
  flex-wrap: wrap;
  grid-gap: 1.2rem;
  align-items: center;
`;

interface Filter<T> {
  label: string;
  filterBy: (item: T) => boolean;
}

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
  filters?: Filter<T>[];
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
  filters,
  ...props
}: DetailCardProps<T>) => {
  const [sortedData, setSortedData] = useState(initialSortBy ? sort(data, initialSortBy) : data);
  const [sortedBy, setSortedBy] = useState(initialSortBy);
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [filterToggle, setFilterToggle] = useState(filterBy ? false : true);
  const [activeFilterIndex, setActiveFilterIndex] = useState<number | undefined>(filters ? 0 : undefined);
  let filteredData =
    !!filters?.length && activeFilterIndex !== undefined
      ? sortedData.filter(filters[activeFilterIndex].filterBy)
      : sortedData;
  filteredData = filterBy && !filterToggle ? filteredData.filter(filterBy) : filteredData;
  const displayData = filteredData;

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
        <SectionContent>
          {!!filterBy && (
            <>
              {filterLabel}
              <ToggleButton
                ariaLabel={filterLabel}
                selected={filterToggle}
                setSelected={setFilterToggle}
                data-testid="filter-toggle"
                data-active={filterToggle}
              />
            </>
          )}
          {SearchBar}
        </SectionContent>
      </StyledCardHeader>
      <StyledFilters>
        {!!filters &&
          filters.map((filter, i) => (
            <StyledFilterButton active={activeFilterIndex === i} onClick={() => setActiveFilterIndex(i)}>
              {filter.label}
            </StyledFilterButton>
          ))}
      </StyledFilters>
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
