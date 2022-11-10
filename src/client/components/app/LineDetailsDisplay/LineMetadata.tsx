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
  LENDER_POSITION_ROLE,
  RevenueSummary,
  TokenView,
} from '@src/core/types';
import { DetailCard, ActionButtons, TokenIcon, ViewContainer } from '@components/app';
import { Button, Text, Tooltip } from '@components/common';
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
  max-width: ${({ theme }) => theme.globalMaxWidth};
  padding: ${({ theme }) => theme.card.padding};
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
      return (
        <MetricDisplay title={t('lineDetails:metadata.revenue.no-revenue')} data={`$ ${totalRevenue} 0 / month`} />
      );
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

  const addSpigotHandler = (token: TokenView) => {
    dispatch(ModalsActions.openModal({ modalName: 'enableSpigot' }));
  };

  const enableAssetHandler = (token: TokenView) => {
    dispatch(ModalsActions.openModal({ modalName: 'enableCollateral' }));
  };

  const allCollateral = [...Object.values(deposits ?? {}), ...Object.values(revenue ?? {})];

  const getCollateralRowActionForRole = (role: string) => {
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
    actions: getCollateralRowActionForRole(userPositionMetadata.role),
  }));

  const getCollateralTableActions = () => {
    console.log('get collateral table actions', userPositionMetadata.role);
    switch (userPositionMetadata.role) {
      case ARBITER_POSITION_ROLE:
      case LENDER_POSITION_ROLE: // for testing
        return (
          <>
            <Button onClick={addSpigotHandler}>{t('lineDetails:metadata.collateral-table.enable-spigot')} </Button>
            <Button onClick={enableAssetHandler}>{t('lineDetails:metadata.collateral-table.enable-asset')} </Button>
          </>
        );
      case BORROWER_POSITION_ROLE:
        return (
          <>
            <Button onClick={depositHandler}>{t('lineDetails:metadata.collateral-table.add-collateral')} </Button>
            <Button onClick={addSpigotHandler}>{t('lineDetails:metadata.collateral-table.enable-spigot')} </Button>
          </>
        );
      default:
        return null;
    }
  };

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

      {(!isEmpty(deposits) || !isEmpty(revenue)) && (
        <ViewContainer>
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
            SearchBar={getCollateralTableActions()}
            searching={false}
            onAction={undefined}
            initialSortBy="value"
            wrap
          />
        </ViewContainer>
      )}
    </>
  );
};
