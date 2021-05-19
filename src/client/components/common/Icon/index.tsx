import { ElementType, SVGProps } from 'react';
import styled from 'styled-components';

import { ReactComponent as BugIcon } from '@assets/icons/bug.svg';
import { ReactComponent as DeleteIcon } from '@assets/icons/delete.svg';
import { ReactComponent as DiscordIcon } from '@assets/icons/discord.svg';
import { ReactComponent as GithubIcon } from '@assets/icons/github.svg';
import { ReactComponent as HamburguerIcon } from '@assets/icons/hamburguer.svg';
import { ReactComponent as HomeIcon } from '@assets/icons/home.svg';
import { ReactComponent as MediumIcon } from '@assets/icons/medium.svg';
import { ReactComponent as TelegramIcon } from '@assets/icons/telegram.svg';
import { ReactComponent as TwitterIcon } from '@assets/icons/twitter.svg';
import { ReactComponent as VaultIcon } from '@assets/icons/vault.svg';
import { ReactComponent as WalletIcon } from '@assets/icons/wallet.svg';

import { styledSystem, StyledSystemProps, TypographyProps } from '../styledSystem';

export interface IconProps
  extends SVGProps<SVGElement>,
    Omit<StyledSystemProps, keyof TypographyProps | 'height' | 'width' | 'opacity' | 'display' | 'order' | 'overflow'> {
  Component: ElementType;
  color?: string;
  onClick?: () => void;
}

export const Icon = styled(({ Component, ...props }: IconProps) => <Component {...props} />)`
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  fill: ${({ theme, color, fill }) => fill ?? color ?? theme.contrasts.primary};
  ${styledSystem};
`;

export {
  BugIcon,
  DeleteIcon,
  DiscordIcon,
  GithubIcon,
  HamburguerIcon,
  HomeIcon,
  MediumIcon,
  TelegramIcon,
  TwitterIcon,
  VaultIcon,
  WalletIcon,
};
