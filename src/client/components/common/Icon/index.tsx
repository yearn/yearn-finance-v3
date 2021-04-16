import React, { FC } from 'react';
import styled from 'styled-components';

import BugIcon from '@assets/icons/bug.svg';
import DeleteIcon from '@assets/icons/delete.svg';
import DiscordIcon from '@assets/icons/discord.svg';
import GithubIcon from '@assets/icons/github.svg';
import HamburguerIcon from '@assets/icons/hamburguer.svg';
import MediumIcon from '@assets/icons/medium.svg';
import TelegramIcon from '@assets/icons/telegram.svg';
import TwitterIcon from '@assets/icons/twitter.svg';

import { styledSystem, StyledSystemProps } from '../styledSystem';

export interface IconProps extends Omit<StyledSystemProps, 'height' | 'width'> {
  src: string;
  height?: string;
  width?: string;
  onClick?: () => void;
}

const StyledImage = styled.img<StyledSystemProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  ${styledSystem}
`;

export const Icon: FC<IconProps> = (props) => <StyledImage {...props} />;

export { BugIcon, DeleteIcon, DiscordIcon, GithubIcon, HamburguerIcon, MediumIcon, TelegramIcon, TwitterIcon };
