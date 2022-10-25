import styled from 'styled-components';
import { isEmpty } from 'lodash';

import { useAppTranslation } from '@hooks';
import { CreditEvent } from '@src/core/types';

const Table = styled.table`
  ${({ theme }) => `
    margin: ${theme.fonts.sizes.xl} 0;
  `}
`;

const TableHeader = styled.h3`
  ${({ theme }) => `
    font-size: ${theme.fonts.sizes.xl};
    font-weight: 600;
    margin: ${theme.spacing.xl} 0;
    color: ${theme.colors.primary};
  `}
`;

const ColumnName = styled.p`
  display: inline;
  font-weight: 600;
  ${({ theme }) => `
    font-size: ${theme.fonts.sizes.lg};
    padding: ${theme.spacing.md} ${theme.spacing.md} ${theme.spacing.md} 0;
    color: ${theme.colors.primary};
  `}
`;

interface CreditEventsTableProps {
  events: CreditEvent[];
}

export const CreditEventsTable = (props: CreditEventsTableProps) => {
  const { t } = useAppTranslation(['common', 'lineDetails']);
  const { events } = props;

  const columnNames = ['positionId', 'timestamp', 'token', 'amount', 'value'];

  const renderEvents = (events: CreditEvent[]) =>
    events.map((e) => {
      const eventName = e.__typename.split(/[A-Z]/).slice(0, 1).join(' '); // remove 'Event' suffix
      return (
        <tr key={e.id}>
          <td>{eventName}</td>
          {columnNames.map((n) => (
            <td key={`${e.id}-${n}`}>{e[n]}</td>
          ))}
        </tr>
      );
    });

  return (
    <>
      <TableHeader>{t('lineDetails:credit-events.title')}</TableHeader>
      {isEmpty(events) ? (
        <ColumnName>{t('lineDetails:credit-events.no-data')}</ColumnName>
      ) : (
        <Table>
          <thead>
            <tr>{isEmpty(events) ? null : columnNames.map((n) => <ColumnName key={n}>{n}</ColumnName>)}</tr>
          </thead>
          <tbody>{renderEvents(events)}</tbody>
        </Table>
      )}
    </>
  );
};
