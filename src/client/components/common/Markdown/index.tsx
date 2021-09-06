import { FC } from 'react';
import ReactMarkdown, { Options } from 'react-markdown';

interface MarkdownProps extends Options {}

export const Markdown: FC<MarkdownProps> = (props) => {
  return <ReactMarkdown {...props} />;
};
