import React, { FC } from 'react';
import styled from 'styled-components';

import HamburguerIcon from '@assets/icons/hamburguer.svg';
import { styledSystem, StyledSystemProps } from '../styledSystem';

export interface IconProps extends Omit<StyledSystemProps, 'height' | 'width'> {
  src: string;
  height?: string;
  width?: string;
  onClick?: () => void;
}

const StyledImage = styled.img<StyledSystemProps>`
  cursor: pointer;
  ${styledSystem}
`;

export const Icon: FC<IconProps> = (props) => <StyledImage {...props} />;

export { HamburguerIcon };
