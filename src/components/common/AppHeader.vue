<script setup lang="ts">
import { storeToRefs } from 'pinia';

import { useUiStore } from '@/stores/ui';

const uiStore = useUiStore();
const { theme } = storeToRefs(uiStore);
</script>

<template>
  <header class="app-header">
    <div class="header-start">
      <button
        type="button"
        class="menu-btn"
        aria-label="打开会话列表"
        @click="uiStore.openMobileDrawer()"
      >
        ☰
      </button>
      <h1 class="app-title">智能聊天助手</h1>
    </div>
    <nav class="header-actions">
      <button
        type="button"
        class="header-btn"
        :aria-label="theme === 'light' ? '切换到深色模式' : '切换到浅色模式'"
        @click="uiStore.toggleTheme()"
      >
        {{ theme === 'light' ? '深色' : '浅色' }}
      </button>
    </nav>
  </header>
</template>

<style scoped>
.app-header {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-panel);
}

.header-start {
  display: flex;
  align-items: center;
  gap: 10px;
}

.menu-btn {
  display: none;
  width: 36px;
  height: 36px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: transparent;
  font-size: 16px;
}

.app-title {
  font-size: 16px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-btn {
  min-height: 36px;
  padding: 7px 12px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: transparent;
  color: var(--color-text);
  font: inherit;
  font-size: 13px;
  line-height: 1.2;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.header-btn:hover:not(:disabled) {
  background: var(--color-bg);
}

.header-btn:focus-visible {
  outline: 2px solid var(--color-text);
  outline-offset: 2px;
}

@media (max-width: 768px) {
  .menu-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
