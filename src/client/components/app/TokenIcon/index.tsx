import { Box } from '@components/common';

const fallbackIcon = 'https://i.imgur.com/7lETB36.png';

interface TokenIconProps {
  icon?: string;
  symbol?: string;
}

export const TokenIcon = ({ icon, symbol }: TokenIconProps) => {
  const src = icon === '' || !icon ? fallbackIcon : icon;
  return (
    <Box display="flex" flexDirection="row" alignItems="center">
      <img alt={symbol ?? 'n/a'} src={src} width="36" height="36" />
    </Box>
  );
};
