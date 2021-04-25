import { useContext, useEffect } from 'react';
import styled from 'styled-components';

import { useAppSelector, useAppDispatch, useAppTranslation } from '@hooks';
import { VaultsActions, VaultsSelectors } from '@store';
import { formatPercent, humanizeAmount } from '@src/utils';
import { Vault } from '@types';
import { BladeContext, NavSideMenuContext } from '@context';
import { AssetCard, Blade } from '@components/app';
import { List, SpinnerLoading } from '@components/common';
import { device } from '@themes/default';

const AssetsList = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 200px;
`;

const TokenIcon = styled.img`
  width: 40px;
`;

const Balance = styled.div`
  font-size: 27px;
  margin-left: 20px;
`;

export const InvestDump = () => {
  const selectedAddress = useAppSelector(({ wallet }) => wallet.selectedAddress);
  const dispatch = useAppDispatch();

  const positions = useAppSelector(VaultsSelectors.selectUserPositions);

  useEffect(() => {
    if (selectedAddress) {
      dispatch(VaultsActions.getVaultsPositionsOf());
    }
  }, [selectedAddress]);

  const positionRows = positions.map((position) => {
    return (
      <tr>
        <td>
          <TokenIcon
            src={`https://raw.githack.com/iearn-finance/yearn-assets/master/icons/tokens/${position.tokenId}/logo-128.png`}
          />
        </td>
        <td>
          <Balance>${parseInt(position.underlyingTokenBalance.amountUsdc._hex, 16) / 10 ** 6}</Balance>
        </td>
      </tr>
    );
  });
  return (
    <AssetsList>
      <table>
        <tbody>{positionRows}</tbody>
      </table>
    </AssetsList>
  );
};
