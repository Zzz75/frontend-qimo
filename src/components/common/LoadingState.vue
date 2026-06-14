<!--
  全局加载中 LoadingState
  显示转圈动画 +「加载中...」文字
-->

<script setup lang="ts">
// 本组件无逻辑，纯展示
</script>

<template>
  <!-- aria-live：内容变化时读屏会通知用户 -->
  <div class="loading-state" aria-live="polite">
    <span class="loading-spinner" aria-hidden="true" />
    <span>加载中...</span>
  </div>
</template>

<style scoped>
.loading-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--color-text-secondary);
}

/* 用 border 旋转模拟 loading 圆圈 */
.loading-spinner {
  width: 28px;
  height: 28px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-text); /* 只有顶边深色，旋转时像缺口 */
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
