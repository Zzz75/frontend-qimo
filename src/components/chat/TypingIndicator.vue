<!--
  打字指示器 TypingIndicator
  AI 正在流式回复时，在消息列表底部显示「AI 正在思考中」和跳动的点
-->

<script setup lang="ts">
// 纯展示组件，无逻辑
</script>

<template>
  <div class="typing-indicator" aria-live="polite" role="status">
    <span class="typing-text">AI 正在思考中</span>
    <span class="typing-dots" aria-hidden="true">
      <i></i><i></i><i></i>
    </span>
  </div>
</template>

<style scoped>
.typing-indicator {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  border-radius: 999px; /* 胶囊形圆角 */
  background: var(--color-bg);
  width: fit-content;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.typing-dots {
  display: inline-flex;
  gap: 4px;
}

.typing-dots i {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.3;
  animation: blink 1.1s infinite ease-in-out; /* 三个点轮流闪烁 */
}

.typing-dots i:nth-child(2) {
  animation-delay: 0.15s;
}

.typing-dots i:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes blink {
  0%,
  80%,
  100% {
    opacity: 0.25;
    transform: translateY(0);
  }
  40% {
    opacity: 1;
    transform: translateY(-1px);
  }
}
</style>
