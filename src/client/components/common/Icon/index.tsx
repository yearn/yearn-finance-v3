import { ElementType, SVGProps } from 'react';
import styled from 'styled-components';

import { ReactComponent as DeleteIcon } from '@assets/icons/delete.svg';
import { ReactComponent as DiscordIcon } from '@assets/icons/discord.svg';
import { ReactComponent as GithubIcon } from '@assets/icons/github.svg';
import { ReactComponent as HamburguerIcon } from '@assets/icons/hamburguer.svg';
import { ReactComponent as HomeIcon } from '@assets/icons/home.svg';
import { ReactComponent as MediumIcon } from '@assets/icons/medium.svg';
import { ReactComponent as TelegramIcon } from '@assets/icons/telegram.svg';
import { ReactComponent as TwitterIcon } from '@assets/icons/twitter.svg';
import { ReactComponent as VaultIcon } from '@assets/icons/vault.svg';
import { ReactComponent as IronBankIcon } from '@assets/icons/iron-bank.svg';
import { ReactComponent as WalletIcon } from '@assets/icons/wallet.svg';
import { ReactComponent as HelpIcon } from '@assets/icons/help.svg';
import { ReactComponent as CloseIcon } from '@assets/icons/close.svg';
import { ReactComponent as ArrowDown } from '@assets/icons/arrow-down.svg';
import { ReactComponent as CollapseIcon } from '@assets/icons/collapse.svg';
import { ReactComponent as SettingsIcon } from '@assets/icons/settings.svg';
import { ReactComponent as ThemesIcon } from '@assets/icons/themes.svg';
import { ReactComponent as ClockIcon } from '@assets/icons/clock.svg';
import { ReactComponent as SearchIcon } from '@assets/icons/search.svg';
import { ReactComponent as LabsIcon } from '@assets/icons/labs.svg';

import { styledSystem, StyledSystemProps, TypographyProps } from '../styledSystem';

export interface IconProps
  extends SVGProps<SVGElement>,
    Omit<StyledSystemProps, keyof TypographyProps | 'height' | 'width' | 'opacity' | 'display' | 'order' | 'overflow'> {
  Component: ElementType;
  color?: string;
  size?: string;
  onClick?: () => void;
}

export const Icon = styled(({ Component, ...props }: IconProps) => <Component {...props} />)`
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  fill: ${({ theme, color, fill }) => fill ?? color ?? theme.colors.secondary};
  width: ${({ size }) => size ?? 'initial'};
  height: ${({ size }) => size ?? 'initial'};
  ${styledSystem};
`;

export {
  DeleteIcon,
  DiscordIcon,
  GithubIcon,
  HamburguerIcon,
  HomeIcon,
  MediumIcon,
  TelegramIcon,
  TwitterIcon,
  VaultIcon,
  IronBankIcon,
  WalletIcon,
  HelpIcon,
  CloseIcon,
  ArrowDown,
  CollapseIcon,
  SettingsIcon,
  ThemesIcon,
  ClockIcon,
  SearchIcon,
  LabsIcon,
};
