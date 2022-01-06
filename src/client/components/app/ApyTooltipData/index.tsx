import { useAppTranslation } from '@src/client/hooks';
import { getConstants } from '@src/config/constants';
import { formatApy } from '@src/utils';
import { Apy } from '@yfi/sdk';
import { FC } from 'react';
import styled from 'styled-components';

const StyledTooltipTable = styled.table`
  & > tr > td {
    font-size: 1.2rem;
    &:first-of-type {
      padding-right: 10px;
    }
  }
`;

export interface ApyTooltipDataProps {
  apy: Apy;
  address: string;
}

const ApyTooltipData: FC<ApyTooltipDataProps> = ({ apy, address }) => {
  const { t } = useAppTranslation(['common', 'vaults']);
  const { CONTRACT_ADDRESSES } = getConstants();
  const { YVECRV, YVBOOST, PSLPYVBOOSTETH } = CONTRACT_ADDRESSES;
  const isBackScratcher = address === YVBOOST || address === YVECRV || address === PSLPYVBOOSTETH;
  const apyType = apy.type;
  const { gross_apr, net_apy, composite } = apy;

  let apyTooltip = (
    <StyledTooltipTable>
      <tr>
        <td>{t('components.tooltips.gross-apr')}:</td>
        <td>{formatApy(gross_apr.toString(), apyType)}</td>
      </tr>
      <tr>
        <td>{t('components.tooltips.net-apy')}:</td>
        <td>{formatApy(net_apy.toString(), apyType)}</td>
      </tr>
    </StyledTooltipTable>
  );

  if (isBackScratcher && composite) {
    const { pool_apy, boost, boosted_apr } = composite;

    apyTooltip = (
      <StyledTooltipTable>
        <tr>
          <td>{t('components.tooltips.vecrv-apy')}:</td>
          <td>{formatApy(pool_apy.toString(), apyType)}</td>
        </tr>
        <tr>
          <td>{t('components.tooltips.boost')}:</td>
          <td>{boost.toFixed(2)}x</td>
        </tr>
        <tr>
          <td>{t('components.tooltips.gross-apr')}:</td>
          <td>{formatApy(boosted_apr.toString(), apyType)}</td>
        </tr>
      </StyledTooltipTable>
    );
  } else if (apyType === 'crv' && composite) {
    const { pool_apy, boost, base_apr, cvx_apr, rewards_apr } = composite;

    apyTooltip = (
      <StyledTooltipTable>
        <tr>
          <td>{t('components.tooltips.pool-apy')}:</td>
          <td>{formatApy(pool_apy.toString(), apyType)}</td>
        </tr>
        <tr>
          <td>{t('components.tooltips.rewards-apr')}:</td>
          <td>{formatApy(rewards_apr.toString(), apyType)}</td>
        </tr>
        <tr>
          <td>{t('components.tooltips.base-apr')}:</td>
          <td>{formatApy(base_apr.toString(), apyType)}</td>
        </tr>
        <tr>
          <td>{t('components.tooltips.boost')}:</td>
          <td>{boost.toFixed(2)}x</td>
        </tr>
        <tr>
          <td>{t('components.tooltips.convex-apr')}:</td>
          <td>{formatApy(cvx_apr.toString(), apyType)}</td>
        </tr>
        <tr>
          <td>{t('components.tooltips.gross-apr')}:</td>
          <td>{formatApy(gross_apr.toString(), apyType)}</td>
        </tr>
        <tr>
          <td>{t('components.tooltips.net-apy')}:</td>
          <td>{formatApy(net_apy.toString(), apyType)}</td>
        </tr>
      </StyledTooltipTable>
    );
  }

  return apyTooltip;
};

export default ApyTooltipData;
