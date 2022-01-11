import { Apy } from '@types';
import { FC } from 'react';
import styled from 'styled-components';
import { useAppTranslation } from '@hooks';
import { getConstants } from '@config/constants';
import { formatApy } from '@utils';

const StyledTooltipTable = styled.table`
  & > tbody > tr > td {
    font-size: 1.2rem;
    &:first-of-type {
      padding-right: 0.5rem;
    }
  }
`;

export interface ApyTooltipDataProps {
  apy: Apy;
  address: string;
}

export const ApyTooltipData: FC<ApyTooltipDataProps> = ({ apy, address }) => {
  const { t } = useAppTranslation(['common']);
  const { CONTRACT_ADDRESSES } = getConstants();
  const { YVECRV } = CONTRACT_ADDRESSES;
  const isBackScratcher = address === YVECRV;
  const apyType = apy.type;
  const { gross_apr, net_apy, composite } = apy;

  let apyTooltip = (
    <StyledTooltipTable>
      <tbody>
        <tr>
          <td>{t('components.tooltips.gross-apr')}:</td>
          <td>{formatApy(gross_apr.toString(), apyType)}</td>
        </tr>
        <tr>
          <td>{t('components.tooltips.net-apy')}:</td>
          <td>{formatApy(net_apy.toString(), apyType)}</td>
        </tr>
      </tbody>
    </StyledTooltipTable>
  );

  if (isBackScratcher && composite) {
    const { pool_apy, boost, boosted_apr } = composite;

    apyTooltip = (
      <StyledTooltipTable>
        <tbody>
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
        </tbody>
      </StyledTooltipTable>
    );
  } else if (apyType === 'crv' && composite) {
    const { pool_apy, boost, base_apr, cvx_apr, rewards_apr } = composite;

    apyTooltip = (
      <StyledTooltipTable>
        <tbody>
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
        </tbody>
      </StyledTooltipTable>
    );
  }

  return apyTooltip;
};
