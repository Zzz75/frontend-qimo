<script setup lang="ts">
import { ref, watch } from 'vue';
import { storeToRefs } from 'pinia';

import EmptyState from '@/components/common/EmptyState.vue';
import { useAutoScroll } from '@/composables/useAutoScroll';
import { useChatStore } from '@/stores/chat';
import { useSessionStore } from '@/stores/session';
import MessageItem from './MessageItem.vue';
import TypingIndicator from './TypingIndicator.vue';

const chatStore = useChatStore();
const sessionStore = useSessionStore();
const { activeMessages, isStreaming, streamBuffer } = storeToRefs(chatStore);
const { activeSessionId } = storeToRefs(sessionStore);

const listRef = ref<HTMLElement | null>(null);
const { scrollToBottom } = useAutoScroll(listRef);

watch(
  [activeMessages, isStreaming, streamBuffer],
  () => {
    scrollToBottom();
  },
  { deep: true }
);
</script>

<template>
  <section ref="listRef" class="message-list" aria-label="消息列表">
    <EmptyState v-if="!activeSessionId" />
    <template v-else>
      <MessageItem
        v-for="message in activeMessages"
        :key="message.id"
        :role="message.role"
        :content="message.content"
      />
      <TypingIndicator v-if="isStreaming" />
    </template>
  </section>
</template>

<style scoped>
.message-list {
  flex: 1;
  overflow: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
