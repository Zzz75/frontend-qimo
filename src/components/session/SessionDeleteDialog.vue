<!--
  删除会话确认弹窗
  Teleport：把弹窗渲染到 body 下，避免被父元素 overflow 裁切
-->

<script setup lang="ts">
import { onUnmounted, watch } from 'vue';

interface SessionDeleteDialogProps {
  open: boolean;        // 是否显示弹窗
  title: string;          // 标题，如「删除会话」
  description: string;    // 说明文字
  confirmLabel?: string;  // 确认按钮文字
}

const props = withDefaults(defineProps<SessionDeleteDialogProps>(), {
  confirmLabel: '删除'
});

const emit = defineEmits<{
  close: [];    // 取消或点遮罩
  confirm: [];  // 确认删除
}>();

/** 点击半透明背景关闭 */
const handleBackdropClick = () => {
  emit('close');
};

/** Esc 键关闭 */
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    emit('close');
  }
};

// 弹窗打开时监听 Esc，关闭或组件销毁时移除监听
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeydown);
      return;
    }
    document.removeEventListener('keydown', handleKeydown);
  },
  { immediate: true }
);

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
  <!-- to="body"：挂到 document.body 下 -->
  <Teleport to="body">
    <div
      v-if="open"
      class="session-delete-dialog"
      role="presentation"
      @click="handleBackdropClick"
    >
      <!-- @click.stop：点面板内部不关闭 -->
      <div
        class="session-delete-dialog__panel"
        role="alertdialog"
        :aria-labelledby="'session-delete-title'"
        :aria-describedby="'session-delete-desc'"
        @click.stop
      >
        <h2 id="session-delete-title" class="session-delete-dialog__title">
          {{ title }}
        </h2>
        <p id="session-delete-desc" class="session-delete-dialog__desc">
          {{ description }}
        </p>
        <div class="session-delete-dialog__actions">
          <button type="button" class="dialog-btn" @click="emit('close')">
            取消
          </button>
          <button type="button" class="dialog-btn is-danger" @click="emit('confirm')">
            {{ confirmLabel }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.session-delete-dialog {
  position: fixed;
  inset: 0; /* 铺满整个视口 */
  z-index: 100;
  display: grid;
  place-items: center;
  padding: 16px;
  background: rgba(0, 0, 0, 0.45);
}

.session-delete-dialog__panel {
  width: min(100%, 360px);
  border-radius: 12px;
  border: 1px solid var(--color-border);
  background: var(--color-panel);
  padding: 20px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);
}

.session-delete-dialog__title {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
}

.session-delete-dialog__desc {
  margin: 0 0 20px;
  font-size: 14px;
  line-height: 1.5;
  color: var(--color-text-secondary);
}

.session-delete-dialog__actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.dialog-btn {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: transparent;
  color: var(--color-text);
  font: inherit;
  font-size: 14px;
  padding: 8px 16px;
  cursor: pointer;
}

.dialog-btn:hover {
  background: var(--color-bg);
}

.dialog-btn.is-danger {
  color: #fff;
  background: #d93025;
  border-color: #d93025;
}

.dialog-btn.is-danger:hover {
  background: #c5221f;
  border-color: #c5221f;
}
</style>
