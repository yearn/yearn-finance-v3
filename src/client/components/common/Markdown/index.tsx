import { FC } from 'react';
import ReactMarkdown, { Options } from 'react-markdown';
import styled from 'styled-components';

const StyledMarkdown = styled(ReactMarkdown)`
  a {
    text-decoration: underline;
    color: inherit;
  }
`;

interface MarkdownProps extends Options {}

export const Markdown: FC<MarkdownProps> = (props) => {
  return <StyledMarkdown linkTarget="_blank" {...props} />;
};
