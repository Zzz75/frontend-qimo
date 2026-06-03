<script setup lang="ts">
import { RouterLink } from 'vue-router';
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
      <button type="button" @click="uiStore.toggleTheme()">
        {{ theme === 'light' ? '深色' : '浅色' }}
      </button>
      <button type="button" disabled title="即将推出">角色</button>
      <RouterLink to="/settings">设置</RouterLink>
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
  gap: 10px;
}

.header-actions button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .menu-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
