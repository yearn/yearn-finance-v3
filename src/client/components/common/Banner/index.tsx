import { FC } from 'react';

interface BannerProps {
  children: React.ReactNode;
}

export const Banner: FC<BannerProps> = ({ children }) => {
  return <div>{children}</div>;
};
