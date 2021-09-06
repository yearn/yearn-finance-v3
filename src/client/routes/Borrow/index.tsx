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
  gap: 2.8rem;
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
`;

export const Borrow = () => {
  return <BorrowView></BorrowView>;
};
