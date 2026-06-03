import { marked } from 'marked';
import { useHighlight } from './useHighlight';

const escapeHtmlAttribute = (value: string): string =>
  value.replace(/[&<>"']/g, (char) => {
    const entityMap: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return entityMap[char] ?? char;
  });

const ensureHttpProtocol = (href: string): string => {
  if (href.startsWith('http://') || href.startsWith('https://')) {
    return href;
  }
  return '#';
};

let isConfigured = false;

export const useMarkdown = () => {
  const { highlightCode } = useHighlight();

  if (!isConfigured) {
    const renderer = new marked.Renderer();
    renderer.code = ({ text, lang }) => {
      const normalizedLanguage = (lang ?? '').trim();
      const highlightedCode = highlightCode(text, normalizedLanguage || undefined);
      const codeClass = normalizedLanguage ? `language-${escapeHtmlAttribute(normalizedLanguage)}` : '';

      return `<pre><code class="hljs ${codeClass}">${highlightedCode}</code></pre>`;
    };

    renderer.link = ({ href, title, text }) => {
      const safeHref = ensureHttpProtocol(href);
      const titleAttr = title ? ` title="${escapeHtmlAttribute(title)}"` : '';
      return `<a href="${safeHref}" target="_blank" rel="noopener noreferrer"${titleAttr}>${text}</a>`;
    };

    // 避免渲染原始 HTML，降低注入风险。
    renderer.html = () => '';

    marked.setOptions({
      gfm: true,
      breaks: true,
      renderer
    });
    isConfigured = true;
  }

  const renderMarkdown = (content: string) => marked.parse(content) as string;

  return {
    renderMarkdown
  };
};
