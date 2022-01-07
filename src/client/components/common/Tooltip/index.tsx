import React, { FC, useRef, useState } from 'react';
import { usePopper } from 'react-popper';
import styled from 'styled-components';
import preventOverflow from '@popperjs/core/lib/modifiers/preventOverflow.js';
import flip from '@popperjs/core/lib/modifiers/flip.js';
import { Placement } from '@popperjs/core';

const StyledTooltipArrow = styled.div`
  position: absolute;
  width: 1rem;
  height: 1rem;
  background: inherit;
  visibility: hidden;
  &:before {
    position: absolute;
    width: 1rem;
    height: 1rem;
    background: inherit;
    visibility: visible;
    content: '';
    transform: rotate(45deg);
  }
`;

const StyledTooltip = styled.div`
  --tooltip-background: ${({ theme }) => theme.colors.background};
  --tooltip-color: ${({ theme }) => theme.colors.onSurfaceH2};

  background: var(--tooltip-background);
  color: var(--tooltip-color);
  fill: currentColor;
  stroke: currentColor;
  user-select: none;
  border-radius: ${({ theme }) => theme.globalRadius};
  position: relative;
  font-size: 1.6rem;
  padding: 0.8rem;
  width: max-content;
  min-width: 11rem;

  &[data-popper-placement^='top'] > ${StyledTooltipArrow} {
    bottom: -0.5rem;
  }

  &[data-popper-placement^='bottom'] > ${StyledTooltipArrow} {
    top: -0.5rem;
  }

  &[data-popper-placement^='left'] > ${StyledTooltipArrow} {
    right: -0.5rem;
  }

  &[data-popper-placement^='right'] > ${StyledTooltipArrow} {
    left: -0.5rem;
  }
`;

function composeEventHandler(handler: (event: string) => void, eventHandler: (event: string) => void) {
  return (event: string) => {
    if (eventHandler) {
      eventHandler(event);
    }
    handler(event);
  };
}

export interface TooltipProps {
  children: React.ReactElement;
  tooltipComponent: React.ReactNode;
  placement: Placement;
}

export const Tooltip: FC<TooltipProps> = ({ children, tooltipComponent, placement }) => {
  const referenceElement = useRef<any>(null);
  const popperElement = useRef<any>(null);
  const arrowElement = useRef<any>(null);
  const [open, setOpen] = useState(false);
  const { styles, attributes, update } = usePopper(referenceElement.current, popperElement.current, {
    placement,
    modifiers: [
      preventOverflow,
      flip,
      {
        name: 'offset',
        options: {
          offset: [0, 14],
        },
      },
      {
        name: 'arrow',
        options: {
          element: arrowElement.current,
        },
      },
    ],
  });

  const childrenProps = {
    ref: referenceElement,
    ...(children ? children.props && children.props : {}),
  };

  const handleOpen = () => {
    setOpen(true);
    update && update();
  };

  const handleClose = () => {
    setOpen(false);
    update && update();
  };

  childrenProps.onMouseOver = composeEventHandler(handleOpen, childrenProps.onMouseOver);
  childrenProps.onMouseLeave = composeEventHandler(handleClose, childrenProps.onMouseLeave);
  childrenProps.onFocus = composeEventHandler(handleOpen, childrenProps.onFocus);
  childrenProps.onBlur = composeEventHandler(handleClose, childrenProps.onBlur);
  childrenProps.onTouchStart = handleOpen;
  childrenProps.onTouchEnd = handleClose;

  console.log(referenceElement)
  return (
    <>
      {React.cloneElement(children, childrenProps)}
      <StyledTooltip
        ref={popperElement}
        style={{
          ...styles.popper,
          display: !open ? 'none' : undefined,
        }}
        {...attributes.popper}
      >
        {tooltipComponent}
        <StyledTooltipArrow ref={arrowElement} style={styles.arrow} data-popper-arrow />
      </StyledTooltip>
    </>
  );
};
