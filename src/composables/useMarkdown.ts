import { marked } from 'marked';

export const useMarkdown = () => {
  const renderMarkdown = (content: string) => marked.parse(content);

  return {
    renderMarkdown
  };
};
