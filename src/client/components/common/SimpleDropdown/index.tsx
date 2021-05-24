import { FC, useState } from 'react';
import styled from 'styled-components';
import { ArrowDown, Icon } from '@components/common';

interface DropdownOption {
  label: string;
  value: string;
}

export interface SimpleDropdownProps {
  selected: DropdownOption;
  setSelected: (selected: DropdownOption) => void;
  options: DropdownOption[];
  className?: string;
  disabled?: boolean;
  onChange?: (selected: DropdownOption | undefined) => void;
}

const StyledSimpleDropdown = styled.div<{ disabled?: boolean; tabIndex: number }>`
  --dropdown-background: ${({ theme }) => theme.colors.onSurface};
  --dropdown-color: ${({ theme }) => theme.colors.primaryVariant};
  --dropdown-hover-color: ${({ theme }) => theme.colors.onSurfaceVariantA};
  --dropdown-selected-color: ${({ theme }) => theme.colors.onPrimaryVariant};

  display: flex;
  background: var(--dropdown-background);
  color: var(--dropdown-color);
  user-select: none;
  border-radius: 0.8rem;
  position: relative;
  font-size: 1.4rem;
  cursor: pointer;
  width: max-content;
  min-width: 9rem;

  ${(props) =>
    props.disabled &&
    `
    cursor: default;
    pointer-events: none;
  `}
`;

const Arrow = styled(Icon)`
  fill: var(--dropdown-color);
  margin-right: 1.6rem;
  transition: transform 100ms ease-in-out;
`;

const DropdownSelected = styled.div<{ open?: boolean }>`
  display: flex;
  align-items: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0.8rem;

  ${(props) =>
    props.open &&
    `
      ${Arrow} {
        transform: rotate(180deg);
      }
  `}
`;

const DropdownOptions = styled.div<{ open?: boolean }>`
  display: none;
  flex-direction: column;
  position: absolute;
  background-color: var(--dropdown-background);
  width: 100%;
  left: 0;
  bottom: 0.8rem;
  transform: translateY(100%);
  border-radius: 0.8rem;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  padding: 0.8rem;
  overflow: hidden;

  ${(props) => props.open && `display: flex;`}
`;

const Option = styled.div<{ selected?: boolean }>`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  ${(props) =>
    props.selected &&
    `
      color: var(--dropdown-selected-color);
  `}

  :hover {
    color: var(--dropdown-hover-color);
  }
`;

export const SimpleDropdown: FC<SimpleDropdownProps> = ({
  selected,
  setSelected,
  options,
  className,
  disabled,
  onChange,
  children,
  ...props
}) => {
  const [open, setOpen] = useState(false);

  let selectedText = 'None';
  if (selected?.value) {
    selectedText = selected.label;
  }

  const selectOption = (option: DropdownOption) => {
    setSelected(option);
    setOpen(false);

    if (onChange) {
      onChange(option);
    }
  };

  return (
    <StyledSimpleDropdown
      className={className}
      tabIndex={0}
      disabled={disabled}
      onBlur={() => setOpen(false)}
      {...props}
    >
      <DropdownSelected onClick={() => setOpen(!open)} open={open}>
        <Arrow Component={ArrowDown} />
        {selectedText}
      </DropdownSelected>

      <DropdownOptions open={open}>
        {options.map((option) => (
          <Option onClick={() => selectOption(option)} selected={option.value === selected.value}>
            {option.label}
          </Option>
        ))}
      </DropdownOptions>
    </StyledSimpleDropdown>
  );
};
