<!--
  空状态组件
  没有消息、没有选会话等场景下显示的提示文字
-->

<script setup lang="ts">
// 定义组件可接收的属性（props）
interface Props {
  message?: string; // 可选的提示文案
}

// withDefaults：给 props 设默认值
withDefaults(defineProps<Props>(), {
  message: '暂无消息，开始新的对话吧。'
});
</script>

<template>
  <div class="empty-state">
    <!-- 显示传入的 message，或使用默认值 -->
    <p>{{ message }}</p>
  </div>
</template>

<style scoped>
.empty-state {
  flex: 1;              /* 占满父容器剩余空间 */
  display: grid;
  place-content: center;
  color: var(--color-text-secondary); /* 次要文字颜色，较淡 */
  text-align: center;
  padding: 24px;
}
</style>
