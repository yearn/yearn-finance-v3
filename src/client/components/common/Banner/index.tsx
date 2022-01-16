import { FC } from 'react';
import styled from 'styled-components';

const StyledBanner = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  position: fixed;
  height: 16px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  z-index: ${({ theme }) => theme.zindex.alerts};
  top: 0;
  left: 0;
  right: 0;
`;

interface BannerProps {
  children: React.ReactNode;
}

export const Banner: FC<BannerProps> = ({ children }) => {
  return <StyledBanner>{children}</StyledBanner>;
};
