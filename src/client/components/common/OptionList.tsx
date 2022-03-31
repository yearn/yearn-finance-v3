import { ElementType, FC, useState } from 'react';
import styled from 'styled-components/macro';

import { ChevronDownIcon, Icon } from './Icon';
import { Text } from './Text';
import { SpinnerLoading } from './SpinnerLoading';

const StyledOptionList = styled.div<{ disabled?: boolean; tabIndex: number; selectable?: boolean }>`
  --dropdown-background: ${({ theme }) => theme.colors.secondary};
  --dropdown-color: ${({ theme }) => theme.colors.titlesVariant};
  --dropdown-hover-color: ${({ theme }) => theme.colors.secondary};
  --dropdown-selected-color: ${({ theme }) => theme.colors.surface};
  --dropdown-selected-background: ${({ theme }) => theme.colors.titles};

  display: flex;
  background: var(--dropdown-background);
  color: var(--dropdown-color);
  fill: currentColor;
  stroke: currentColor;
  user-select: none;
  border-radius: ${({ theme }) => theme.globalRadius};
  position: relative;
  font-size: 1.6rem;
  cursor: ${({ selectable }) => (selectable ? 'pointer' : null)};
  padding: 0 0.8rem;
  width: max-content;
  min-width: 11rem;

  ${(props) =>
    props.disabled &&
    `
    cursor: default;
    pointer-events: none;
  `}
`;

const StyledText = styled(Text)`
  flex: 1;
`;

const StyledSpinnerLoading = styled(SpinnerLoading)`
  font-size: 1rem;
  flex: 1;
`;

const ArrowIcon = styled(Icon)<{ open?: boolean }>`
  margin-left: 0.8rem;
  height: 0.8rem;
  transition: transform 150ms ease-in-out;
  transform: rotate(${({ open }) => (open ? '180deg' : '0deg')});
`;

const StyledIcon = styled(Icon)`
  width: 1.6rem;
  height: 1.6rem;
  margin-right: 0.8rem;
  flex-shrink: 0;
`;

const Options = styled.div<{ open?: boolean; listPosition: 'top' | 'bottom' }>`
  display: none;
  flex-direction: column;
  flex-grow: 1;
  position: absolute;
  background-color: var(--dropdown-background);
  width: 100%;
  max-height: 20rem;
  left: 0;
  border-radius: ${({ theme }) => theme.globalRadius};
  padding: 0.8rem;
  overflow: hidden;
  overflow-y: auto;
  z-index: 1;

  ${(props) => props.open && `display: flex;`}
  ${(props) =>
    props.listPosition === 'top' &&
    `
    top: -0.8rem;
    transform: translateY(-100%);
  `}
  ${(props) =>
    props.listPosition === 'bottom' &&
    `
      bottom: -0.8rem;
      transform: translateY(100%);
  `}
`;

const OptionChild = styled.div<{ selected?: boolean }>`
  display: flex;
  align-items: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  border-radius: ${({ theme }) => theme.globalRadius};
  padding: 0.6rem;
  transition: opacity 200ms ease-in-out;
  width: 100%;
  position: relative;
  flex-shrink: 0;

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
  isLoading?: boolean;
  disabled?: boolean;
  hideIcons?: boolean;
  listPosition?: 'top' | 'bottom' | undefined;
  onChange?: (selected: Option) => void;
}

export const OptionList: FC<OptionListProps> = ({
  selected,
  setSelected,
  options,
  className,
  isLoading,
  disabled,
  hideIcons,
  onChange,
  listPosition,
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
    if (disabled) {
      return;
    }

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
      <OptionChild onClick={() => (!isSingleOption && !disabled ? setOpen(!open) : null)}>
        {!hideIcons && selected?.Icon && <StyledIcon Component={selected.Icon} />}

        {!isLoading && <StyledText ellipsis>{selectedText}</StyledText>}
        {isLoading && <StyledSpinnerLoading />}

        <ArrowIcon Component={ChevronDownIcon} open={open} />
      </OptionChild>

      <Options open={open} listPosition={listPosition ? listPosition : 'bottom'}>
        {options.map((option) => (
          <OptionChild
            key={option.value}
            onClick={() => selectOption(option)}
            selected={option.value === selected.value}
          >
            {!hideIcons && option?.Icon && <StyledIcon Component={option.Icon} />}
            <StyledText ellipsis>{option.label}</StyledText>
          </OptionChild>
        ))}
      </Options>
    </StyledOptionList>
  );
};
