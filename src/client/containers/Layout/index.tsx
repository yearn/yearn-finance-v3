import { FC, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';

import { initApp, changeRoute, walletSelect } from '@store';
import { useAppDispatch, useAppSelector } from '@hooks';
import { Navigation } from '@components/app';
import { Box } from '@components/common';

const Content = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  flex: 1;
  padding-top: ${(props) => props.theme.navbar.height};
`;

export const Layout: FC = ({ children }) => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const selectedAddress = useAppSelector(({ wallet }) => wallet.selectedAddress);

  useEffect(() => {
    dispatch(initApp());
  }, []);

  useEffect(() => {
    dispatch(changeRoute({ path: location.pathname }));
  }, [location]);

  return (
    <Box display="flex" flexDirection="column" flex="1">
      <Navigation walletAddress={selectedAddress ?? undefined} onWalletClick={() => dispatch(walletSelect())} />
      <Content>{children}</Content>
    </Box>
  );
};
