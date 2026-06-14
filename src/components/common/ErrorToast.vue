<!--
  错误提示条 ErrorToast
  API 失败等场景显示红色条，用户可点 × 关闭
-->

<script setup lang="ts">
interface ErrorToastProps {
  message?: string;
}

withDefaults(defineProps<ErrorToastProps>(), {
  message: '请求失败，请稍后重试。'
});

// defineEmits：声明组件会向外触发的事件
const emit = defineEmits<{
  dismiss: []; // 关闭时触发，父组件监听 @dismiss
}>();
</script>

<template>
  <!-- role="alert"：读屏软件会立即播报错误 -->
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
  background: #ffe9e9; /* 浅红背景 */
  color: #9d2121;      /* 深红文字 */
}

.error-message {
  flex: 1;
  font-size: 14px;
}

.dismiss-btn {
  flex-shrink: 0; /* 不被压缩 */
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
