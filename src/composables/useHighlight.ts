import hljs from 'highlight.js';

export const useHighlight = () => {
  const highlightCode = (code: string, language?: string): string => {
    if (language && hljs.getLanguage(language)) {
      const highlighted = hljs.highlight(code, { language });
      return highlighted.value;
    }

    const highlighted = hljs.highlightAuto(code);
    return highlighted.value;
  };

  return {
    highlightCode
  };
};
