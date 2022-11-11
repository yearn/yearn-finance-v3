import { isEmpty } from 'lodash';
import { BigNumber } from 'ethers';
import styled from 'styled-components';

import { useAppTranslation } from '@hooks';
import { ThreeColumnLayout } from '@src/client/containers/Columns';
import { EscrowDeposit, EscrowDepositList } from '@src/core/types';
import { normalizeAmount, numberWithCommas, prettyNumbers } from '@src/utils';

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

interface LineMetadataProps {
  principal: string;
  deposit: string;
  totalInterestPaid: string;
  startTime: number;
  endTime: number;
  revenue?: { [token: string]: string };
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
            !d ? sum : sum.add(BigNumber.from(d!.currentUsdPrice ?? '1').mul(d!.amount)), // temporary until we get proper pricing on subgraph
          BigNumber.from('0')
        )
        .div(BigNumber.from(1)) // scale to usd decimals
        .toString();

  const renderEscrowMetadata = () => {
    if (!deposits) return null;
    if (!totalCollateral) return;
    <MetricDisplay
      title={t('lineDetails:metadata.escrow.no-collateral')}
      data={`$ ${prettyNumbers(totalCollateral)}`}
    />;
    return (
      <MetricDisplay title={t('lineDetails:metadata.escrow.total')} data={`$ ${prettyNumbers(totalCollateral)}`} />
    );
  };
  const renderSpigotMetadata = () => {
    if (!revenue) return null;
    if (!totalRevenue)
      return (
        <MetricDisplay title={t('lineDetails:metadata.revenue.no-revenue')} data={`$ ${prettyNumbers(totalRevenue)}`} />
      );
    return (
      <MetricDisplay title={t('lineDetails:metadata.revenue.per-month')} data={`$ ${prettyNumbers(totalRevenue)}`} />
    );
  };

  return (
    <>
      <ThreeColumnLayout>
        <MetricDisplay title={t('lineDetails:metadata.principal')} data={`$ ${prettyNumbers(principal)}`} />
        <MetricDisplay title={t('lineDetails:metadata.deposit')} data={`$ ${prettyNumbers(deposit)}`} />
        <MetricDisplay
          title={t('lineDetails:metadata.totalInterestPaid')}
          data={`$ ${prettyNumbers(totalInterestPaid)}`}
        />
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
          <MetricDisplay title={t('lineDetails:metadata.revenue.no-revenue')} data={prettyNumbers(totalRevenue)} />
        )}

        {!isEmpty(deposits) &&
          Object.values(deposits!).map(
            (d, i) =>
              d.enabled && (
                <ThreeColumnLayout>
                  Deposit #{i}: {d.token} {prettyNumbers(d.amount)}
                </ThreeColumnLayout>
              )
          )}
      </ThreeColumnLayout>
    </>
  );
};
