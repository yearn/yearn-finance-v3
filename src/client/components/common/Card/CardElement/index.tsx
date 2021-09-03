import { FC, ReactNode } from 'react';
import styled from 'styled-components';

import { Icon, ArrowDownIcon } from '@components/common/Icon';

const Container = styled.div<{ width?: string; align?: string; grow?: string; fontWeight?: number }>`
  display: flex;
  flex-direction: column;
  width: ${({ width }) => width ?? '17rem'};
  align-items: ${({ align }) => align ?? 'flex-start'};
  flex-grow: ${({ grow }) => grow ?? '0'};
  margin: 0.825rem ${({ theme }) => theme.cardPadding};
  font-weight: ${({ fontWeight }) => fontWeight ?? 400};
`;

const SortIcon = styled(Icon)<{ active?: boolean }>`
  height: 1.1rem;
  margin-left: 0.4rem;
  transform: rotateZ(180deg);
  fill: currentColor;
  transition: transform 200ms ease-in-out;

  ${({ active, theme }) =>
    active &&
    `
    transform: rotateZ(0);
    color: ${theme.colors.onSurfaceH2};
  `}
`;

const Header = styled.div<{ onClick?: () => void }>`
  display: flex;
  align-items: center;
  font-size: 1.4rem;
  color: ${({ theme }) => theme.colors.onSurfaceSH1};
  cursor: ${({ onClick }) => (onClick ? 'pointer' : 'default')};
`;

const Content = styled.div`
  margin-top: 0.5rem;
  font-size: 2.4rem;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  max-width: 100%;
  color: ${({ theme }) => theme.colors.onSurfaceH2};
`;

interface CardElementProps {
  header?: string;
  sortable?: boolean;
  activeSort?: boolean;
  content?: string | ReactNode;
  width?: string;
  align?: 'flex-start' | 'center' | 'flex-end';
  grow?: '1' | '0';
  fontWeight?: number;
  onClick?: () => void;
  className?: string;
}

export const CardElement: FC<CardElementProps> = ({
  children,
  header,
  sortable,
  activeSort,
  content,
  width,
  align,
  grow,
  fontWeight,
  onClick,
  className,
  ...props
}) => {
  return (
    <Container width={width} align={align} grow={grow} fontWeight={fontWeight} className={className} {...props}>
      {header && (
        <Header onClick={onClick}>
          {header}
          {sortable && <SortIcon active={activeSort} Component={ArrowDownIcon} />}
        </Header>
      )}
      {content && <Content>{content}</Content>}
      {children && <Content>{children}</Content>}
    </Container>
  );
};
