import { useState, useEffect, ReactNode } from 'react';
import styled from 'styled-components';

import { sort } from '@utils';
import { device } from '@themes/default';

import { Box, BoxProps } from '../Box';

const Container = styled(Box)<{ columns: number }>`
  display: grid;
  grid-template-columns: ${({ columns }) =>
    columns > 2 ? `repeat(${columns - 1}, 1fr) 3fr` : `repeat(${columns}, 1fr`};
  grid-template-rows: auto;
  grid-gap: 16px 32px;
  width: 100%;

  @media ${device.tablet} {
    grid-gap: 16px 16px;
  }

  @media ${device.mobile} {
    grid-template-columns: ${({ columns }) => (columns > 2 ? `repeat(${columns - 2}, 1fr)` : `repeat(${columns}, 1fr`)};
    grid-gap: 8px 8px;
  }
`;

const Row = styled(Box)`
  display: contents;
  color: ${({ theme }) => theme.colors.titles};

  &:first-child {
    font-weight: bold;
    font-size: 12px;
    line-height: 16px;
    color: ${({ theme }) => theme.colors.texts};
  }
`;

const Cell = styled(Box)<{ columns: number }>`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  text-align: end;
  cursor: ${({ onClick }) => (onClick ? 'pointer' : undefined)};

  ${({ columns }) =>
    `
    &:nth-child(${columns}n + 1) {
      justify-content: flex-start;
      text-align: start;
    }

    @media ${device.mobile} {
      &:nth-child(${columns}n + 1) {
        grid-column: 1 / -1;
      }

      &:nth-child(${columns}n) {
        grid-column: 1 / -1;
        margin-bottom: 8px;
      }
    }
  `}
`;

interface Metadata<T> {
  key: Extract<keyof T, string>;
  header?: string;
  width?: string;
  sortable?: boolean;
  format?: (item: T) => string;
  transform?: (item: T) => ReactNode;
}

interface TableProps<T> extends BoxProps {
  header: string;
  metadata: Metadata<T>[];
  data: T[];
  initialSortBy?: Extract<keyof T, string>;
}

export const Table = <T,>({ header, metadata, data, initialSortBy, ...props }: TableProps<T>) => {
  const [sortedData, setSortedData] = useState(initialSortBy ? sort(data, initialSortBy) : data);
  const [sortedBy, setSortedBy] = useState(initialSortBy);
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const displayData = sortedData;
  const columns = metadata.length ?? 0;

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

  if (data.length === 0) {
    return null;
  }

  return (
    <Container columns={columns} {...props}>
      {!!displayData.length && (
        <Row>
          {metadata.map(({ key, header, width, sortable }) => (
            <Cell key={key} columns={columns} onClick={() => (sortable ? handleSort(key) : undefined)} width={width}>
              {header}
            </Cell>
          ))}
        </Row>
      )}

      {displayData.map((item, i) => (
        <Row>
          {metadata.map(({ key, width, format, transform }) => (
            <Cell key={`cell-${key}-${i}`} columns={columns} width={width}>
              {transform ? transform(item) : format ? format(item) : item[key]}
            </Cell>
          ))}
        </Row>
      ))}
    </Container>
  );
};
