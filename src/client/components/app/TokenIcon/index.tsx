import styled from 'styled-components';

import { Img } from '@components/common';

const fallbackIcon = '';

const StyledTokenIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

type TokenIconSize = 'default' | 'big' | 'xBig' | 'xxBig';

interface TokenIconProps {
  icon?: string;
  symbol?: string;
  size?: TokenIconSize;
}

export const TokenIcon = ({ icon, symbol, size, ...props }: TokenIconProps) => {
  const src = icon === '' || !icon ? fallbackIcon : icon;
  let height;
  switch (size) {
    case 'big':
      height = 42;
      break;
    case 'xBig':
      height = 48;
      break;
    case 'xxBig':
      height = 55;
      break;
    default:
      height = 36;
      break;
  }
  const width = height;

  return (
    <StyledTokenIcon {...props}>
      {src && <Img alt={symbol ?? 'n/a'} width={width} height={height} src={src} />}
    </StyledTokenIcon>
  );
};
