/**
 * 组合式函数：消息列表自动滚到底部
 * composable：Vue 3 里可复用的逻辑，多个组件都能 import 使用
 */

import { nextTick, type Ref } from 'vue';

/**
 * @param containerRef 消息列表容器的 DOM 引用
 * @returns scrollToBottom 函数，调用后滚到最底部
 */
export const useAutoScroll = (containerRef: Ref<HTMLElement | null>) => {
  const scrollToBottom = async (behavior: ScrollBehavior = 'smooth') => {
    await nextTick(); // 等 Vue 把新消息画到 DOM 后再滚，否则高度不准
    const container = containerRef.value;
    if (!container) return; // 容器还没挂载则跳过
    container.scrollTo({
      top: container.scrollHeight, // 滚到内容总高度 = 最底部
      behavior                        // 'smooth' 平滑滚动，'auto' 瞬间跳
    });
  };

  return {
    scrollToBottom
  };
};
