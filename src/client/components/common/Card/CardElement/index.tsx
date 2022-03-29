import { FC, ReactNode } from 'react';
import styled from 'styled-components';

import { Icon, ArrowDownIcon, IconProps } from '@components/common';

const Container = styled.div<{ width?: string; align?: string; grow?: string; fontWeight?: number }>`
  display: flex;
  flex-direction: column;
  width: ${({ width }) => width ?? '17rem'};
  align-items: ${({ align }) => align ?? 'flex-start'};
  flex-grow: ${({ grow }) => grow ?? '0'};
  margin: 0.825rem ${({ theme }) => theme.card.padding};
  font-weight: ${({ fontWeight }) => fontWeight ?? 400};
`;

interface SortIconProps extends Omit<IconProps, 'ref'> {
  activeSort?: boolean;
  sortType?: SortType;
}

const SortIcon = styled(({ activeSort, sortType, ...props }: SortIconProps) => <Icon {...props} />)`
  height: 1.1rem;
  margin-left: 0.4rem;
  fill: currentColor;
  transition: transform 200ms ease-in-out;
  flex-shrink: 0;
  transform: rotateZ(0);

  ${({ activeSort, sortType, theme }) =>
    activeSort &&
    `
    color: ${theme.colors.titles};
    transform: ${sortType === 'asc' ? 'rotateZ(180deg)' : 'rotateZ(0deg)'};
  `}
`;

const Header = styled.div<{ onClick?: () => void }>`
  display: flex;
  align-items: center;
  font-size: 1.6rem;
  color: ${({ theme }) => theme.colors.texts};
  cursor: ${({ onClick }) => (onClick ? 'pointer' : 'default')};
`;

const Content = styled.div`
  display: inline-flex;
  align-items: center;
  margin-top: 0.8rem;
  font-size: 2.4rem;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  max-width: 100%;
  color: ${({ theme }) => theme.colors.texts};

  :first-child img {
    margin-right: ${({ theme }) => theme.layoutPadding};
  }
`;

type SortType = 'asc' | 'desc';
interface CardElementProps {
  header?: string;
  sortable?: boolean;
  activeSort?: boolean;
  sortType?: SortType;
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
  sortType,
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
          {sortable && <SortIcon activeSort={activeSort} sortType={sortType} Component={ArrowDownIcon} />}
        </Header>
      )}
      {content && <Content>{content}</Content>}
      {children && <Content>{children}</Content>}
    </Container>
  );
};
