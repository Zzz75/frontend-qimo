import { nextTick, ref, type Ref } from 'vue';

export const useAutoScroll = (containerRef: Ref<HTMLElement | null>) => {
  const scrollToBottom = async (behavior: ScrollBehavior = 'smooth') => {
    await nextTick();
    const container = containerRef.value;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior });
  };

  return {
    scrollToBottom
  };
};
