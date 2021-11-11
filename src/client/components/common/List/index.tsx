import { ComponentType, PropsWithChildren } from 'react';

import { Box, BoxProps } from '../Box';

interface ListProps<T1> extends BoxProps {
  Component: ComponentType<T1>;
  items: Array<PropsWithChildren<T1> & { key: string | number }>;
  itemProps?: Partial<T1>;
}

export const List = <T1,>({ Component, items, itemProps, ...props }: ListProps<T1>) => {
  return (
    <Box {...props}>
      {items.map((item) => (
        <Component {...itemProps} {...item} />
      ))}
    </Box>
  );
};
