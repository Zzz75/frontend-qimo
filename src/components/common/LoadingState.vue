<script setup lang="ts"></script>

<template>
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

.loading-spinner {
  width: 28px;
  height: 28px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-text);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
