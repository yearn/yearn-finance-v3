import { FC, useState } from 'react';
import styled from 'styled-components';

import { ArrowDownIcon, Icon } from '../Icon';

const StyledSimpleDropdown = styled.div<{ disabled?: boolean; tabIndex: number; selectable?: boolean }>`
  --dropdown-background: ${({ theme }) => theme.colors.secondary};
  --dropdown-color: ${({ theme }) => theme.colors.titlesVariant};
  --dropdown-hover-color: ${({ theme }) => theme.colors.secondary};
  --dropdown-selected-color: ${({ theme }) => theme.colors.titlesVariant};

  display: flex;
  background: var(--dropdown-background);
  color: var(--dropdown-color);
  user-select: none;
  border-radius: ${({ theme }) => theme.globalRadius};
  position: relative;
  font-size: 1.4rem;
  cursor: ${({ selectable }) => (selectable ? 'pointer' : null)};
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
  transition: transform 100ms ease-in-out;
`;

const DropdownSelected = styled.div<{ open?: boolean }>`
  display: flex;
  align-items: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0.8rem;
  width: 100%;
  ${(props) =>
    props.open &&
    `
      ${Arrow} {
        transform: rotate(180deg);
      }
  `}
`;

const SelectedText = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
`;

const DropdownOptions = styled.div<{ open?: boolean }>`
  display: none;
  flex-direction: column;
  flex-grow: 1;
  position: absolute;
  background-color: var(--dropdown-background);
  width: 100%;
  left: 0;
  bottom: 0.8rem;
  transform: translateY(100%);
  border-radius: ${({ theme }) => theme.globalRadius};
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  padding: 0.8rem;
  overflow: hidden;
  z-index: 1;
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

interface DropdownOption {
  value: string;
  label: string;
}

export interface SimpleDropdownProps {
  selected: DropdownOption;
  setSelected: (selected: DropdownOption) => void;
  options: DropdownOption[];
  className?: string;
  disabled?: boolean;
  onChange?: (selected: DropdownOption) => void;
}

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
  const isSingleOption = options.length === 1;

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
      selectable={!isSingleOption}
      onBlur={() => setOpen(false)}
      {...props}
    >
      <DropdownSelected onClick={() => (!isSingleOption ? setOpen(!open) : null)} open={open}>
        {!isSingleOption && <Arrow Component={ArrowDownIcon} />}
        <SelectedText>{selectedText}</SelectedText>
      </DropdownSelected>

      <DropdownOptions open={open}>
        {options.map((option) => (
          <Option key={option.value} onClick={() => selectOption(option)} selected={option.value === selected.value}>
            {option.label}
          </Option>
        ))}
      </DropdownOptions>
    </StyledSimpleDropdown>
  );
};
