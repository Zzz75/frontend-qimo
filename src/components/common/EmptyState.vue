<script setup lang="ts">
interface EmptyStateProps {
  message?: string;
}

withDefaults(defineProps<EmptyStateProps>(), {
  message: '暂无消息，开始新的对话吧。'
});
</script>

<template>
  <div class="empty-state">
    <p>{{ message }}</p>
  </div>
</template>

<style scoped>
.empty-state {
  flex: 1;
  display: grid;
  place-content: center;
  color: var(--color-text-secondary);
  text-align: center;
  padding: 24px;
}
</style>
