import { FC } from 'react';
import styled from 'styled-components/macro';

export interface ToggleButtonProps {
  selected: boolean;
  setSelected: (selected: boolean) => void;
  className?: string;
  disabled?: boolean;
  color?: string;
  onClick?: () => void;
}

const ToggleCircle = styled.div`
  background: var(--toggle-color);
  border-radius: 100%;
  width: calc(var(--toggle-size) - 0.8rem);
  height: calc(var(--toggle-size) - 0.8rem);
  position: absolute;
  transition: transform 200ms ease-in-out;
  left: 50%;
  transform: translateX(calc(-100% - var(--toggle-offset) / 2 - var(--toggle-x-offset)));
`;

const StyledToggleButton = styled.button<{ selected?: boolean }>`
  --toggle-size: 2.4rem;
  /* NOTE This defines how much extra width should have (size + offset) */
  --toggle-offset: 0rem;
  /* NOTE This defines separation between toggle circle and borders. */
  --toggle-x-offset: 0.3rem;

  --toggle-color: ${({ theme }) => theme.colors.toggleSwitch.color};
  --toggle-color-selected: ${({ theme }) => theme.colors.toggleSwitch.selected.color};
  --toggle-background: ${({ theme }) => theme.colors.toggleSwitch.background};
  --toggle-background-selected: ${({ theme }) => theme.colors.toggleSwitch.selected.background};

  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--toggle-background);
  border: 2px solid var(--toggle-color);
  border-radius: 99rem;
  outline: none;
  padding: 0;
  cursor: pointer;
  height: var(--toggle-size);
  width: calc(var(--toggle-size) * 2 + var(--toggle-offset));
  transition: all 200ms ease-in-out;
  position: relative;

  ${({ selected, theme }) =>
    selected &&
    `
      background: var(--toggle-background-selected);
      color: var(--toggle-color-selected);
      ${ToggleCircle} {
        background: var(--toggle-color-selected);
        transform: translateX(calc(0% + var(--toggle-offset) / 2 + var(--toggle-x-offset)));
      }
  `};

  &:hover {
    filter: brightness(90%);
  }
`;

export const ToggleButton: FC<ToggleButtonProps> = ({
  selected,
  setSelected,
  className,
  disabled,
  color,
  onClick,
  ...props
}) => (
  <StyledToggleButton
    className={className}
    selected={selected}
    disabled={disabled}
    color={color}
    onClick={() => setSelected(!selected)}
    {...props}
  >
    <ToggleCircle />
  </StyledToggleButton>
);
