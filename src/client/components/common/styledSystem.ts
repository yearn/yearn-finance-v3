import {
  system,
  compose,
  space,
  color as ssColor,
  typography,
  layout,
  flexbox,
  grid,
  background,
  border,
  position,
  shadow,
  SpaceProps,
  ColorProps as SSColorProps,
  TypographyProps,
  LayoutProps,
  FlexboxProps,
  GridProps,
  BackgroundProps,
  BorderProps,
  BordersProps,
  PositionProps,
  ShadowProps,
  TextColorProps,
} from 'styled-system';

interface ColorProps extends Omit<SSColorProps, 'color'> {
  textColor?: TextColorProps['color'];
}

export const color = compose(
  ssColor,
  system({
    textColor: {
      property: 'color',
      scale: 'colors',
    },
  })
);

type StyledSystemProps = SpaceProps &
  ColorProps &
  TypographyProps &
  LayoutProps &
  FlexboxProps &
  GridProps &
  BackgroundProps &
  BorderProps &
  BordersProps &
  PositionProps &
  ShadowProps;

export type {
  StyledSystemProps,
  SpaceProps,
  ColorProps,
  TypographyProps,
  LayoutProps,
  FlexboxProps,
  GridProps,
  BackgroundProps,
  BorderProps,
  BordersProps,
  PositionProps,
  ShadowProps,
};

export const styledSystem = compose(
  space,
  color,
  typography,
  layout,
  flexbox,
  grid,
  background,
  border,
  position,
  shadow
);
