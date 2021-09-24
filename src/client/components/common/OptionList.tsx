import { ElementType, FC, useState } from 'react';
import styled from 'styled-components';

import { Icon } from '@components/common';

const StyledOptionList = styled.div<{ disabled?: boolean; tabIndex: number; selectable?: boolean }>`
  --dropdown-background: ${({ theme }) => theme.colors.surface};
  --dropdown-color: ${({ theme }) => theme.colors.onSurfaceH2};
  --dropdown-hover-color: ${({ theme }) => theme.colors.secondary};
  --dropdown-selected-color: ${({ theme }) => theme.colors.surface};
  --dropdown-selected-background: ${({ theme }) => theme.colors.onSurfaceH2};

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

const OptionSelected = styled.div`
  display: flex;
  align-items: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0.8rem;
  width: 100%;
`;

const SelectedText = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
`;

const Options = styled.div<{ open?: boolean }>`
  display: none;
  flex-direction: column;
  flex-grow: 1;
  position: absolute;
  background-color: var(--dropdown-background);
  width: 100%;
  left: 0;
  bottom: -0.8rem;
  transform: translateY(100%);
  border-radius: ${({ theme }) => theme.globalRadius};
  padding: 0.8rem;
  overflow: hidden;
  z-index: 1;
  ${(props) => props.open && `display: flex;`}
`;

const OptionChild = styled.div<{ selected?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  border-radius: ${({ theme }) => theme.globalRadius};
  padding: 0.4rem;
  transition: opacity 200ms ease-in-out;

  ${(props) =>
    props.selected &&
    `
      color: var(--dropdown-selected-color);
      background: var(--dropdown-selected-background);
  `}

  :hover {
    opacity: 0.8;
  }
`;

interface Option {
  value: string;
  label: string;
  Icon?: ElementType;
}

export interface OptionListProps {
  selected: Option;
  setSelected: (selected: Option) => void;
  options: Option[];
  className?: string;
  disabled?: boolean;
  onChange?: (selected: Option) => void;
}

export const OptionList: FC<OptionListProps> = ({
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

  const selectOption = (option: Option) => {
    setSelected(option);
    setOpen(false);

    if (onChange) {
      onChange(option);
    }
  };

  return (
    <StyledOptionList
      className={className}
      tabIndex={0}
      disabled={disabled}
      selectable={!isSingleOption}
      onBlur={() => setOpen(false)}
      {...props}
    >
      <OptionSelected onClick={() => (!isSingleOption ? setOpen(!open) : null)}>
        {selected?.Icon && <Icon Component={selected.Icon} />}
        <SelectedText>{selectedText}</SelectedText>
      </OptionSelected>

      <Options open={open}>
        {options.map((option) => (
          <OptionChild
            key={option.value}
            onClick={() => selectOption(option)}
            selected={option.value === selected.value}
          >
            {option?.Icon && <Icon Component={option.Icon} />}
            {option.label}
          </OptionChild>
        ))}
      </Options>
    </StyledOptionList>
  );
};
