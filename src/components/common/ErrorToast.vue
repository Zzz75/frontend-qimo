<script setup lang="ts">
interface ErrorToastProps {
  message?: string;
}

withDefaults(defineProps<ErrorToastProps>(), {
  message: '请求失败，请稍后重试。'
});

const emit = defineEmits<{
  dismiss: [];
}>();
</script>

<template>
  <div class="error-toast" role="alert">
    <span class="error-message">{{ message }}</span>
    <button type="button" class="dismiss-btn" aria-label="关闭错误提示" @click="emit('dismiss')">
      ×
    </button>
  </div>
</template>

<style scoped>
.error-toast {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 0 16px 8px;
  padding: 10px 12px;
  border-radius: 8px;
  background: #ffe9e9;
  color: #9d2121;
}

.error-message {
  flex: 1;
  font-size: 14px;
}

.dismiss-btn {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: inherit;
  font-size: 18px;
  line-height: 1;
}

.dismiss-btn:hover {
  background: rgba(157, 33, 33, 0.1);
}
</style>
