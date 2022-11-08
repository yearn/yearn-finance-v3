import { isEmpty } from 'lodash';
import { BigNumber } from 'ethers';
import styled from 'styled-components';

import { device } from '@themes/default';
import { useAppDispatch, useAppSelector, useAppTranslation } from '@hooks';
import { ThreeColumnLayout } from '@src/client/containers/Columns';
import {
  ARBITER_POSITION_ROLE,
  BORROWER_POSITION_ROLE,
  Collateral,
  EscrowDeposit,
  EscrowDepositList,
  RevenueSummary,
  TokenView,
} from '@src/core/types';
import { DetailCard, ActionButtons, TokenIcon } from '@components/app';
import { Text, Tooltip } from '@components/common';
import { LinesSelectors, ModalsActions, WalletSelectors } from '@src/core/store';
import { humanize } from '@src/utils';

const SectionHeader = styled.h3`
  ${({ theme }) => `
    font-size: ${theme.fonts.sizes.xl};
    font-weight: 600;
    margin: ${theme.spacing.xl} 0;
    color: ${theme.colors.primary};
  `}
`;

const MetricContainer = styled.div`
  ${({ theme }) => `
    margin-bottom: ${theme.spacing.xl};
  `}
`;

const MetricName = styled.h3`
  ${({ theme }) => `
    font-size: ${theme.fonts.sizes.lg};
    font-weight: 600;
    margin-bottom: ${theme.spacing.md};
    color: ${theme.colors.primary};
  `}
`;

const DataMetric = styled.h5`
  ${({ theme }) => `
    font-size: ${theme.fonts.sizes.md};
  `}
`;

const DataSubMetricsContainer = styled.div``;

const DataSubMetric = styled.p``;

const AssetsListCard = styled(DetailCard)`
  @media ${device.tablet} {
    .col-name {
      width: 18rem;
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
` as typeof DetailCard;

interface LineMetadataProps {
  principal: string;
  deposit: string;
  totalInterestPaid: string;
  startTime: number;
  endTime: number;
  revenue?: { [token: string]: RevenueSummary };
  deposits?: EscrowDepositList;
}

interface Metric {
  title: string;
  data: string;
}

interface MetricDisplay extends Metric {
  title: string;
  data: string;
  displaySubmetrics?: boolean;
  submetrics?: Metric[];
}

const MetricDisplay = ({ title, data, displaySubmetrics = false, submetrics }: MetricDisplay) => {
  return (
    <MetricContainer>
      <MetricName>{title}</MetricName>
      <DataMetric>{data}</DataMetric>
      {displaySubmetrics && (
        <DataSubMetricsContainer>
          {submetrics?.map(({ title, data }) => (
            <DataSubMetric>
              {title} : {data}
            </DataSubMetric>
          ))}
        </DataSubMetricsContainer>
      )}
    </MetricContainer>
  );
};

export const LineMetadata = (props: LineMetadataProps) => {
  const { t } = useAppTranslation(['common', 'lineDetails']);
  const walletIsConnected = useAppSelector(WalletSelectors.selectWalletIsConnected);
  const userPositionMetadata = useAppSelector(LinesSelectors.selectUserPositionMetadata);
  const dispatch = useAppDispatch();

  const { principal, deposit, totalInterestPaid, revenue, deposits } = props;
  const modules = [revenue && 'revenue', deposits && 'escrow'].filter((x) => !!x);
  const totalRevenue = isEmpty(revenue)
    ? ''
    : Object.values(revenue!)
        .reduce((sum, rev) => sum.add(BigNumber.from(rev)), BigNumber.from('0'))
        .div(BigNumber.from(1)) // scale to usd decimals
        .toString();

  const totalCollateral = isEmpty(deposits)
    ? ''
    : Object.values(deposits!)
        .reduce<BigNumber>(
          (sum: BigNumber, d: EscrowDeposit) =>
            !d ? sum : sum.add(BigNumber.from(Number(d!.token.priceUsdc) ?? '0').mul(d!.amount)),
          BigNumber.from('0')
        )
        .div(BigNumber.from(1)) // scale to usd decimals
        .toString();

  const renderEscrowMetadata = () => {
    if (!deposits) return null;
    if (!totalCollateral)
      return <MetricDisplay title={t('lineDetails:metadata.escrow.no-collateral')} data={`$ ${totalCollateral}`} />;
    return <MetricDisplay title={t('lineDetails:metadata.escrow.total')} data={`$ ${totalCollateral}`} />;
  };
  const renderSpigotMetadata = () => {
    if (!revenue) return null;
    if (!totalRevenue)
      return <MetricDisplay title={t('lineDetails:metadata.revenue.no-revenue')} data={`$ ${totalRevenue}`} />;
    return <MetricDisplay title={t('lineDetails:metadata.revenue.per-month')} data={`$ ${totalRevenue}`} />;
  };

  const formatAssetsTableRow = (deposit: EscrowDeposit) => ({
    key: deposit.token.toString(),
    header: deposit.token.toString(),
    align: 'flex-start',
  });

  const depositHandler = (token: TokenView) => {
    dispatch(ModalsActions.openModal({ modalName: 'addCollateral' }));
  };

  const allCollateral = [...Object.values(deposits ?? {}), ...Object.values(revenue ?? {})];

  const getActionForRole = (role: string) => {
    switch (role) {
      case ARBITER_POSITION_ROLE:
        return 'liquidate';
      case BORROWER_POSITION_ROLE:
      default:
        console.log('add collateral action selected for buuton');
        return 'add-collateral';
    }
  };
  const formattedCollataralData = allCollateral.map((c) => ({
    ...c,
    key: c.type + c.token.toString(),
    // header: c.type + c.token.toString(),
    align: 'flex-start',
    actions: getActionForRole(userPositionMetadata.role),
  }));

  return (
    <>
      <ThreeColumnLayout>
        <MetricDisplay title={t('lineDetails:metadata.principal')} data={`$ ${principal}`} />
        <MetricDisplay title={t('lineDetails:metadata.deposit')} data={`$ ${deposit}`} />
        <MetricDisplay title={t('lineDetails:metadata.totalInterestPaid')} data={`$ ${totalInterestPaid}`} />
      </ThreeColumnLayout>
      <SectionHeader>
        {t('lineDetails:metadata.secured-by')}
        {modules.map((m) => t(`lineDetails:metadata.${m}.title`)).join(' + ')}
      </SectionHeader>

      {!revenue && !deposits && <MetricName>{t('lineDetails:metadata.unsecured')}</MetricName>}

      <ThreeColumnLayout>
        {renderSpigotMetadata()}
        {renderEscrowMetadata()}
      </ThreeColumnLayout>

      <ThreeColumnLayout>
        {!isEmpty(revenue) && (
          <MetricDisplay title={t('lineDetails:metadata.revenue.no-revenue')} data={totalRevenue} />
        )}

        {(!isEmpty(deposits) || !isEmpty(revenue)) && (
          <>
            <AssetsListCard
              header={t('lineDetails:metadata.escrow.assets-list.title')}
              data-testid="line-assets-list"
              metadata={[
                {
                  key: 'type',
                  header: t('lineDetails:metadata.escrow.assets-list.type'),
                  transform: ({ type }) => (
                    <>
                      <Text>{type?.toUpperCase()}</Text>
                    </>
                  ),
                  width: '10rem',
                  sortable: true,
                  className: 'col-type',
                },
                {
                  key: 'token',
                  header: t('lineDetails:metadata.escrow.assets-list.symbol'),
                  transform: ({ token: { symbol, icon } }) => (
                    <>
                      {icon && <TokenIcon icon={icon} symbol={symbol} />}
                      <Text>{symbol}</Text>
                    </>
                  ),
                  width: '15rem',
                  sortable: true,
                  className: 'col-symbol',
                },
                {
                  key: 'amount',
                  header: t('lineDetails:metadata.escrow.assets-list.amount'),
                  transform: ({ token: { balance } }) => <Text ellipsis> {balance} </Text>,
                  sortable: true,
                  width: '20rem',
                  className: 'col-amount',
                },
                {
                  key: 'value',
                  header: t('lineDetails:metadata.escrow.assets-list.value'),
                  format: ({ value }) => humanize('usd', value, 2 /* 4 decimals but as percentage */, 0),
                  sortable: true,
                  width: '20rem',
                  className: 'col-value',
                },
                {
                  key: 'actions',
                  transform: ({ token }) => (
                    <ActionButtons
                      actions={[
                        {
                          name: t('components.transaction.deposit'),
                          handler: () => depositHandler(token),
                          disabled: !walletIsConnected,
                        },
                      ]}
                    />
                  ),
                  align: 'flex-end',
                  width: 'auto',
                  grow: '1',
                },
              ]}
              data={formattedCollataralData}
              SearchBar={null}
              searching={false}
              onAction={undefined}
              initialSortBy="value"
              wrap
            />
            {/* <AssetsListCard
                header={t('components.list-card.opportunities')}
                data-testid="vaults-opportunities-list"
                metadata={[
                  {
                    key: 'displayName',
                    header: t('components.list-card.asset'),
                    transform: ({ displayIcon, displayName, token }) => (
                      <>
                        <TokenIcon icon={displayIcon} symbol={token.symbol} />
                        <Text ellipsis>{displayName}</Text>
                      </>
                    ),
                    width: '23rem',
                    sortable: true,
                    className: 'col-name',
                  },

                  {
                    key: 'apy',
                    header: t('components.list-card.apy'),
                    transform: ({ apyData, apyMetadata, apyType, address }) => (
                      <ApyTooltip apyType={apyType} apyData={apyData} apyMetadata={apyMetadata} address={address} />
                    ),
                    sortable: true,
                    width: '8rem',
                    className: 'col-apy',
                  },
                  {
                    key: 'vaultBalanceUsdc',
                    header: t('components.list-card.total-assets'),
                    format: ({ vaultBalanceUsdc }) => humanize('usd', vaultBalanceUsdc, USDC_DECIMALS, 0),
                    sortable: true,
                    width: '15rem',
                    className: 'col-assets',
                  },
                  {
                    key: 'userTokenBalance',
                    header: t('components.list-card.available-deposit'),
                    format: ({ token }) =>
                      token.balance === '0' ? '-' : humanize('amount', token.balance, token.decimals, 4),
                    sortable: true,
                    width: '15rem',
                    className: 'col-available',
                  },
                  {
                    key: 'actions',
                    transform: ({ address }) => (
                      <ActionButtons
                        actions={[
                          {
                            name: t('components.transaction.deposit'),
                            handler: () => depositHandler(address),
                            disabled: !walletIsConnected,
                          },
                        ]}
                      />
                    ),
                    align: 'flex-end',
                    width: 'auto',
                    grow: '1',
                  },
                ]}
                data={filteredVaults.map((vault) => ({
                  ...vault,
                  apy: orderApy(vault.apyData, vault.apyType),
                  userTokenBalance: normalizeAmount(vault.token.balance, vault.token.decimals),
                  userTokenBalanceUsdc: vault.token.balanceUsdc,
                  actions: null,
                }))}
                SearchBar={
                  <SearchInput
                    searchableData={opportunities}
                    searchableKeys={['name', 'displayName', 'token.symbol', 'token.name']}
                    placeholder={t('components.search-input.search')}
                    onSearch={(data) => setFilteredVaults(data)}
                  />
                }
                searching={opportunities.length > filteredVaults.length}
                onAction={({ address }) => history.push(`/vault/${address}`)}
                initialSortBy="apy"
                wrap
              /> */}
          </>
        )}
      </ThreeColumnLayout>
    </>
  );
};
