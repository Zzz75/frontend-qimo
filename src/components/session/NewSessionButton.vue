<!--
  新建会话按钮
  点击后在 sessionStore 里创建一个新会话并选中
-->

<script setup lang="ts">
import { useSessionStore } from '@/stores/session';

const sessionStore = useSessionStore();
</script>

<template>
  <button type="button" class="new-session-btn" @click="sessionStore.createSession()">
    + 新建会话
  </button>
</template>

<style scoped>
.new-session-btn {
  width: 100%;
  padding: 8px 12px;
  border: 1px dashed var(--color-border); /* 虚线边框表示「添加」 */
  border-radius: 8px;
  background: transparent;
  font: inherit;
  color: var(--color-text);
}

.new-session-btn:hover {
  background: var(--color-bg);
}
</style>
