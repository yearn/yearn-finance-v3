import { FC } from 'react';
import styled from 'styled-components';

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
  width: var(--toggle-size);
  height: var(--toggle-size);
  position: absolute;
  transition: transform 200ms ease-in-out;
  left: 50%;

  transform: translateX(calc(0% + var(--toggle-offset) / 2));
  transform: translateX(calc(-100% - var(--toggle-offset) / 2));
`;

const StyledToggleButton = styled.button<{ selected?: boolean }>`
  --toggle-size: 2.6rem;
  --toggle-offset: 0.2rem;
  --toggle-color: ${({ theme }) => theme.contrasts.shade30};
  --toggle-background: ${({ theme }) => theme.oldColors.shade30};

  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--toggle-background);
  border-radius: 999rem;
  outline: none;
  border: 0;
  padding: 0;
  cursor: pointer;
  height: var(--toggle-size);
  width: calc(var(--toggle-size) * 2 + var(--toggle-offset));
  transition: filter 200ms ease-in-out;
  position: relative;

  &[selected] {
    background: lime;
  }
  &:hover {
    filter: brightness(110%);
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
