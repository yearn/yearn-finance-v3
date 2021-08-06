import styled from 'styled-components';

const fallbackIcon = '';

const StyledTokenIcon = styled.div<{ size?: TokenIconSize }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.6rem;

  img {
    width: 100%;
    height: auto;
  }

  ${({ size }) => size === 'big' && `width: 4.2rem;`}
  ${({ size }) => size === 'xBig' && `width: 4.8rem;`}
  ${({ size }) => size === 'xxBig' && `width: 5.5rem;`}
`;

type TokenIconSize = 'default' | 'big' | 'xBig' | 'xxBig';

interface TokenIconProps {
  icon?: string;
  symbol?: string;
  size?: TokenIconSize;
}

export const TokenIcon = ({ icon, symbol, size, ...props }: TokenIconProps) => {
  const src = icon === '' || !icon ? fallbackIcon : icon;
  return (
    <StyledTokenIcon size={size} {...props}>
      {src && <img alt={symbol ?? 'n/a'} src={src} />}
    </StyledTokenIcon>
  );
};
