import { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import styled from 'styled-components';

import {
  useAppTranslation,
  useAppDispatch,
  useSelectedCreditLine,

  // used to dummy token for dev
  useAppSelector,
  useSelectedSellToken,
} from '@hooks';
import { toBN } from '@src/utils';
import { ThreeColumnLayout } from '@src/client/containers/Columns';

const SectionHeader = styled.h3`
  ${({ theme }) => `
    font-size: ${theme.fonts.sizes.xl};
    font-weight: 600;
    margin-bottom: ${theme.spacing.lg};
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

interface LineMetadataDisplay {
  principal: string;
  deposit: string;
  totalInterestPaid: string;
  startTime: number;
  endTime: number;
  revenue?: { [token: string]: string };
  deposits?: { [token: string]: string };
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

export const LineMetadataDisplay = (props: LineMetadataDisplay) => {
  const { t } = useAppTranslation(['common', 'lineDetails']);
  const { principal, deposit, totalInterestPaid, revenue, deposits } = props;
  const modules = [revenue && 'revenue', deposits && 'escrow'].filter((x) => !!x);
  const totalRevenue = !revenue
    ? '0'
    : Object.values(revenue)
        .reduce((sum, rev) => sum.plus(toBN(rev)), toBN())
        .div(toBN(1))
        .toString();
  const totalCollateral = !deposits
    ? '0'
    : Object.values(deposits)
        .reduce((sum, rev) => sum.plus(toBN(rev)), toBN())
        .div(toBN(1))
        .toString();
  // TODO gereneralize MetricNAme/DataMetric/SubMetricContainer/SubMetric
  // for more DRY and reuse logic for open/close
  return (
    <>
      <ThreeColumnLayout>
        <MetricDisplay title={t('lineDetails:metadata.principal')} data={`$ ${principal}`} />
        <MetricDisplay title={t('lineDetails:metadata.deposit')} data={`$ ${deposit}`} />
        <MetricDisplay title={t('lineDetails:metadata.totalInterestPaid')} data={`$ ${totalInterestPaid}`} />
      </ThreeColumnLayout>
      <SectionHeader>
        {t('lineDetails:metadata.secured-by')}
        {modules.map((m) => t(`lineDetails:metadata.${m}.title`)).join(' + ')}:
      </SectionHeader>
      {!revenue && !deposits ? (
        <MetricName>{t('lineDetails:metadata.no-collateral')}</MetricName>
      ) : (
        <ThreeColumnLayout>
          {revenue && <MetricDisplay title={t('lineDetails:metadata.revenue.per-month')} data={totalRevenue} />}
          {deposits && <MetricDisplay title={t('lineDetails:metadata.escrow.total')} data={totalCollateral} />}
        </ThreeColumnLayout>
      )}
    </>
  );
};
