import { FC } from 'react';
import styled from 'styled-components';

interface BannerProps {
  children: React.ReactNode;
}

export const Banner: FC<BannerProps> = ({ children }) => {
  return <>{children}</>;
};
