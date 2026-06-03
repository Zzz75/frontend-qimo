<script setup lang="ts">
import type { ChatRole } from '@/types/chat';
import MarkdownRenderer from './MarkdownRenderer.vue';

interface MessageItemProps {
  role: ChatRole;
  content: string;
}

defineProps<MessageItemProps>();
</script>

<template>
  <article class="message-item">
    <header class="message-role">{{ role }}</header>
    <MarkdownRenderer :content="content" />
  </article>
</template>

<style scoped>
.message-item {
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 12px;
}

.message-role {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-bottom: 8px;
  text-transform: uppercase;
}
</style>
