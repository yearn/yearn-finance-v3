import styled from 'styled-components';
import { isEmpty } from 'lodash';

import { useAppTranslation } from '@hooks';
import { CreditEvent } from '@src/core/types';
import { device } from '@themes/default';
import { DetailCard, ActionButtons, ViewContainer } from '@components/app';
import { SpinnerLoading, Text, Tooltip, Input, SearchIcon, Button } from '@components/common';
import { humanize, USDC_DECIMALS } from '@utils';

const Table = styled.table`
  ${({ theme }) => `
    margin: ${theme.fonts.sizes.xl} 0;
  `}
`;

const PositionsCard = styled(DetailCard)`
  max-width: ${({ theme }) => theme.globalMaxWidth};
  padding: ${({ theme }) => theme.card.padding};
  @media ${device.tablet} {
    .col-name {
      width: 100%;
    }
  }
  @media (max-width: 750px) {
    .col-assets {
      display: none;
    }
  }
  @media ${device.mobile} {
    .col-available {
      width: 10rem;
    }
  }
  @media (max-width: 450px) {
    .col-available {
      display: none;
    }
  }
  @media (min-width: 780px) {
    .col-available {
      border: 2px solid red;
    }
  }
` as typeof DetailCard;

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
  events: [];
}

export const CreditEventsTable = (props: CreditEventsTableProps) => {
  const { t } = useAppTranslation(['common', 'lineDetails']);
  const { events } = props;

  const columnNames = ['deposit', 'status', 'tokenAddress', 'lender'];

  const renderEvents = (events: CreditEvent[]) =>
    events.map((e) => {
      return (
        <tr key={e.id}>
          {columnNames.map((n) =>
            n === 'token' ? (
              <td key={`${e.id}-${n}`}>{`${e[n]}`}</td>
            ) : n === 'value' ? (
              <td key={`${e.id}-${n}`}>{`${e[n]}`}</td>
            ) : (
              <td key={`${e.id}-${n}`}>{`${e[n]}`}</td>
            )
          )}
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
      {isEmpty(events) ? (
        ''
      ) : (
        <ViewContainer>
          <PositionsCard
            header={t('components.positions-card.positions')}
            data-testid="vaults-opportunities-list"
            metadata={[
              {
                key: 'displayName',
                header: t('components.positions-card.positions'),
                width: '23rem',
                sortable: true,
                className: 'col-name',
              },
              /** @TODO add tags e.g. spigot here */
              {
                key: 'deposit',
                header: t('components.positions-card.positions'),
                sortable: true,
                width: '15rem',
                className: 'col-assets',
              },
              {
                key: 'status',
                header: t('components.positions-card.status'),
                sortable: true,
                width: '8rem',
                className: 'col-apy',
              },
              {
                key: 'lender',
                header: t('components.positions-card.lender'),
                sortable: true,
                width: '15rem',
                className: 'col-available',
              },
              {
                key: 'actions',
                transform: () => (
                  <ActionButtons
                    actions={[
                      {
                        name: t('components.transaction.liquidate'),
                        handler: () => console.log('hi'),
                        disabled: false,
                      },
                    ]}
                  />
                ),
                align: 'flex-end',
                width: 'auto',
                grow: '1',
              },
            ]}
            data={events.map((event) => ({
              deposit: event['deposit'],
              displayName: event['id'],
              status: event['status'],
              lender: event['lender'],
              actions: null,
            }))}
            SearchBar={
              <Input
                value={''}
                onChange={(e) => console.log('hi')}
                placeholder={t('components.search-input.search')}
                Icon={SearchIcon}
              />
            }
            searching={false}
            filterLabel="Show 0% APY"
            //@ts-ignore
            filterBy={''}
            //@ts-ignore
            onAction={console.log('o')}
            wrap
          />
        </ViewContainer>
      )}
    </>
  );
};
