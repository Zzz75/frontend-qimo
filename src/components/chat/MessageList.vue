<!--
  ???? MessageList
  ???????????????????????????
-->

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
const { activeMessages, isStreaming } = storeToRefs(chatStore);
const { activeSessionId } = storeToRefs(sessionStore);

const listRef = ref<HTMLElement | null>(null);
const { scrollToBottom } = useAutoScroll(listRef);

watch(
  [activeMessages, isStreaming],
  () => {
    scrollToBottom();
  },
  { deep: true }
);
</script>

<template>
  <section ref="listRef" class="message-list" aria-label="????">
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
  --message-list-scrollbar-thumb: #c8ced8;
  --message-list-scrollbar-thumb-hover: #aeb6c4;
  --message-list-scrollbar-track: transparent;

  flex: 1;
  overflow: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  scrollbar-color: var(--message-list-scrollbar-thumb) var(--message-list-scrollbar-track);
  scrollbar-width: thin;
}

:global(:root[data-theme='dark']) .message-list {
  --message-list-scrollbar-thumb: #4a4a4a;
  --message-list-scrollbar-thumb-hover: #626262;
}

</style>
