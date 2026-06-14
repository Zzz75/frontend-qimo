<!--
  顶栏 AppHeader
  显示：汉堡菜单（仅手机）、标题、深色/浅色切换按钮
-->

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useUiStore } from '@/stores/ui';

const uiStore = useUiStore();
const { theme } = storeToRefs(uiStore); // 当前主题，用于按钮文字和 aria-label
</script>

<template>
  <header class="app-header">
    <div class="header-start">
      <!-- 手机端显示：打开会话列表抽屉 -->
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
      <!-- 点击切换 light / dark -->
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
  align-items: center;           /* 垂直居中 */
  justify-content: space-between; /* 左右两端对齐 */
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
  display: none; /* 桌面端隐藏菜单按钮 */
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
  outline: 2px solid var(--color-text); /* 键盘聚焦时的轮廓 */
  outline-offset: 2px;
}

@media (max-width: 768px) {
  .menu-btn {
    display: inline-flex; /* 手机端显示汉堡按钮 */
    align-items: center;
    justify-content: center;
  }
}
</style>
