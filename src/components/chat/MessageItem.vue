<!--
  单条消息 MessageItem
  显示：角色标签（user / assistant）+ Markdown 渲染后的内容
-->

<script setup lang="ts">
import type { ChatRole } from '@/types/chat';
import MarkdownRenderer from './MarkdownRenderer.vue';

// 父组件传入：谁发的、正文内容
interface MessageItemProps {
  role: ChatRole;
  content: string;
}

defineProps<MessageItemProps>();
</script>

<template>
  <article class="message-item">
    <!-- 顶部小字显示角色 -->
    <header class="message-role">{{ role }}</header>
    <!-- 正文交给 MarkdownRenderer 转成 HTML 显示 -->
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
  text-transform: uppercase; /* 角色名大写显示 */
}
</style>
