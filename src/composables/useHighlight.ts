import hljs from 'highlight.js';

export const useHighlight = () => {
  const highlightCode = (code: string, language: string): string => {
    const highlighted = hljs.highlight(code, { language });
    return highlighted.value;
  };

  return {
    highlightCode
  };
};
