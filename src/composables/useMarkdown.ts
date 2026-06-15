/**
 * 组合式函数：Markdown 转 HTML
 * AI 回复常用 Markdown（标题、列表、代码块等），这里负责安全地渲染成网页 HTML
 */

import { marked } from 'marked'; // Markdown 解析库
import { useHighlight } from './useHighlight';

/** 转义 HTML 特殊字符，防止注入到属性里出问题 */
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

/** 链接只允许 http/https，防止 javascript: 等危险协议 */
const ensureHttpProtocol = (href: string): string => {
  if (href.startsWith('http://') || href.startsWith('https://')) {
    return href;
  }
  return '#'; // 不安全的链接变成空锚点
};

// marked 全局配置只需做一次，用标志位避免重复配置
let isConfigured = false;

/**
 * Markdown 渲染组合式函数。
 *
 * marked 工作流程：Markdown 字符串 → 词法/语法分析 → 调用 Renderer 各钩子生成 HTML 片段 → 拼接成完整 HTML。
 * 本项目通过 marked.use() 覆盖 renderer，注入代码高亮并收紧链接与原始 HTML 的处理策略。
 */
export const useMarkdown = () => {
  if (!isConfigured) {
    const renderer = new marked.Renderer();

    // 自定义「代码块」怎么渲染：先高亮，再包在 <pre><code> 里
    renderer.code = ({ text, lang }) => {
      const normalizedLanguage = (lang ?? '').trim();
      const highlightedCode = highlightCode(text, normalizedLanguage || undefined);
      const codeClass = normalizedLanguage ? `language-${escapeHtmlAttribute(normalizedLanguage)}` : '';

      return `<pre><code class="hljs ${codeClass}">${highlightedCode}</code></pre>`;
    };

    // 自定义「链接」：新标签打开，加 rel 防钓鱼
    renderer.link = ({ href, title, text }) => {
      const safeHref = ensureHttpProtocol(href);
      const titleAttr = title ? ` title="${escapeHtmlAttribute(title)}"` : '';
      return `<a href="${safeHref}" target="_blank" rel="noopener noreferrer"${titleAttr}>${text}</a>`;
    };

    // 禁止渲染原始 HTML 标签，降低 XSS 风险
    renderer.html = () => '';

    marked.setOptions({
      gfm: true,      // GitHub 风格 Markdown（表格等）
      breaks: true,   // 单个换行也变成 <br>
      renderer
    });
    isConfigured = true;
  }

  /** 把 Markdown 字符串解析成 HTML 字符串 */
  const renderMarkdown = (content: string) => marked.parse(content) as string;

  return {
    renderMarkdown
  };
};
