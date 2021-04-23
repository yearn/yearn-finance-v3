import { useContext, useEffect } from 'react';
import styled from 'styled-components';

import { useAppSelector, useAppDispatch, useAppTranslation } from '@hooks';
import { IronBankActions, IronBankSelectors } from '@store';
import { formatPercent, humanizeAmount } from '@src/utils';
import { BladeContext, NavSideMenuContext } from '@context';
import { AssetCard } from '@components/app';
import { List, SpinnerLoading } from '@components/common';
import { device } from '@themes/default';

import { BladeDump } from '@components/app/BladeDump';

const BorrowView = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const DefaultPageContent = styled.div`
  display: flex;
  max-width: ${({ theme }) => theme.globalMaxWidth};
  width: 100%;
  grid-gap: 2.8rem;
  padding: 0 4rem;
  margin-top: 2.1rem;
  padding-bottom: 4rem;

  @media ${device.tablet} {
    flex-direction: column;
  }
`;

const BorrowInfo = styled.div`
  display: flex;
  flex-direction: column;
  width: 40rem;

  h3 {
    margin-top: 1.6rem;
  }
  .t-body-light {
    margin-top: 0.7rem;
  }

  @media ${device.tablet} {
    order: -1;
    width: 100%;
  }
`;

const AssetList = styled.div`
  --vaults-columns: 1fr 1fr 12rem;
  --vaults-padding: 1.1rem;

  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 2rem 0;
  flex: 1;
  min-width: 39rem;
`;

const AssetsHeaders = styled.div`
  display: grid;
  grid-template-columns: var(--vaults-columns);
  padding: var(--vaults-padding);
`;

const ErrorMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: ${({ theme }) => theme.colors.error};
`;

export const Borrow = () => {
  const { t } = useAppTranslation('common');
  const { close: closeNavSidemenu } = useContext(NavSideMenuContext);
  const { open: openBlade, isOpen } = useContext(BladeContext);
  console.log(isOpen);
  const dispatch = useAppDispatch();
  const selectedAddress = useAppSelector(({ wallet }) => wallet.selectedAddress);
  const generalIronBankStatus = useAppSelector(IronBankSelectors.selectIronBankGeneralStatus);
  const cyTokens = useAppSelector(IronBankSelectors.selectCyTokens);
  const selectedCyToken = useAppSelector(IronBankSelectors.selectSelectedCyToken);

  let assetList;

  if (!generalIronBankStatus.loading && !generalIronBankStatus.error) {
    assetList = (
      <AssetList>
        <AssetsHeaders>
          <span>{t('save.assets-headers.asset')}</span>
          <span>{t('save.assets-headers.balance')}</span>
          <span>{t('save.assets-headers.earning')}</span>
        </AssetsHeaders>
        <List
          Component={AssetCard}
          items={cyTokens.map((cyToken) => ({
            key: cyToken.address,
            icon: `https://raw.githack.com/iearn-finance/yearn-assets/master/icons/tokens/${cyToken.token.address}/logo-128.png`,
            name: cyToken.name,
            balance: humanizeAmount(cyToken.suppliedBalance, parseInt(cyToken.token.decimals), 2),
            earning: formatPercent(cyToken.lendApy, 0),
            onClick: () => selectCyToken(cyToken.address),
          }))}
          width={1}
        />
      </AssetList>
    );
  } else if (generalIronBankStatus.loading) {
    assetList = (
      <AssetList>
        <SpinnerLoading flex="1" />
      </AssetList>
    );
  } else {
    assetList = (
      <AssetList>
        <ErrorMessage>
          {t('errors.default')}
          <br />
          {generalIronBankStatus.error}
        </ErrorMessage>
      </AssetList>
    );
  }

  const saveInfo = (
    <BorrowInfo>
      <span className="t-captions">Borrow</span>
      <h3>Deep-dive, borrow</h3>
      <span className="t-body-light">
        something will be written here that hints at what usrs can do with these lists. from ways of customising the
        view, shortcuts, click throughs and how these lists can lead to customised transactions... more to follow.{' '}
      </span>
    </BorrowInfo>
  );

  const selectCyToken = (cyTokenAddress: string) => {
    dispatch(IronBankActions.setSelectedCyTokenAddress({ cyTokenAddress }));
    closeNavSidemenu();
    openBlade();
  };

  useEffect(() => {
    dispatch(IronBankActions.initiateIronBank());
  }, []);

  useEffect(() => {
    if (selectedAddress) {
      dispatch(IronBankActions.getUserCyTokens());
    }
  }, [selectedAddress]);

  return (
    <BorrowView>
      <BladeDump data={selectedCyToken} />
      <DefaultPageContent>
        {assetList}
        {saveInfo}
      </DefaultPageContent>
    </BorrowView>
  );
};
