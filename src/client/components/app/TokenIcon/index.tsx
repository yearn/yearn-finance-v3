import styled from 'styled-components';

import { Img, LogoIcon } from '@components/common';

const fallbackIcon = '';

const StyledTokenIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

type TokenIconSize = 'default' | 'big' | 'xBig' | 'xxBig';

interface TokenIconProps {
  icon?: string;
  SVG?: React.FC;
  symbol?: string;
  size?: TokenIconSize;
}

export const TokenIcon = ({ SVG, icon, symbol, size }: TokenIconProps) => {
  const src = icon === '' || !icon ? fallbackIcon : icon;
  let height;
  switch (size) {
    case 'big':
      height = '4.2rem';
      break;
    case 'xBig':
      height = '6.4rem';
      break;
    case 'xxBig':
      height = '8rem';
      break;
    default:
      height = '3.2rem';
      break;
  }
  const width = height;
  const style = {
    minWidth: width,
    minHeight: height,
    width: width,
    height: height,
  };

  return (
    <StyledTokenIcon>{SVG ? <SVG /> : src && <Img alt={symbol ?? 'n/a'} style={style} src={src} />}</StyledTokenIcon>
  );
};
