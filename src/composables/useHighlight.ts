/**
 * 组合式函数：代码语法高亮
 * 使用 highlight.js 库，把纯文本代码转成带颜色的 HTML
 */

import hljs from 'highlight.js';

export const useHighlight = () => {
  /**
   * @param code 源代码字符串
   * @param language 语言名，如 'javascript'、'python'；不传则自动猜测
   */
  const highlightCode = (code: string, language?: string): string => {
    // 若指定了语言且 highlight.js 认识，用精确高亮
    if (language && hljs.getLanguage(language)) {
      const highlighted = hljs.highlight(code, { language });
      return highlighted.value; // 带 <span class="hljs-xxx"> 的 HTML 字符串
    }

    // 否则自动检测语言
    const highlighted = hljs.highlightAuto(code);
    return highlighted.value;
  };

  return {
    highlightCode
  };
};
