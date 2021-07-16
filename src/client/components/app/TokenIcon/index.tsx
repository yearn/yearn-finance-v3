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
  ${({ size }) => size === 'extraBig' && `width: 5.5rem;`}
`;

type TokenIconSize = 'default' | 'big' | 'extraBig';

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
