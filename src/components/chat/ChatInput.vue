<!--
  聊天输入框 ChatInput
  底部多行文本框 + 发送按钮
  Enter 发送，Shift+Enter 换行
-->

<script setup lang="ts">
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useChatStore } from '@/stores/chat';

const chatStore = useChatStore();
const { canSend, isSending } = storeToRefs(chatStore); // 能否发送、是否发送中

const draft = ref(''); // 输入框里正在打的字（双向绑定 v-model）
const textareaRef = ref<HTMLTextAreaElement | null>(null); // 输入框 DOM，发送后用来重新聚焦

/** 发送消息：清空输入框 → 调 store → 聚焦输入框 */
const handleSend = async () => {
  const content = draft.value.trim(); // 去掉首尾空格
  draft.value = '';
  await chatStore.sendMessage(content);
  textareaRef.value?.focus(); // ?. 表示 ref 有值才调 focus
};

/** 键盘：Enter 发送，Shift+Enter 换行，中文输入法 composing 时不拦截 */
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key !== 'Enter' || event.shiftKey || event.isComposing) return;
  event.preventDefault(); // 阻止 Enter 默认换行
  handleSend();
};
</script>

<template>
  <footer class="chat-input">
    <!-- v-model：输入内容和 draft 双向同步；disabled 时不能输入 -->
    <textarea
      ref="textareaRef"
      v-model="draft"
      rows="3"
      placeholder="请输入内容，Enter 发送，Shift+Enter 换行"
      aria-label="聊天输入框"
      :disabled="!canSend"
      @keydown="handleKeydown"
    />
    <button
      type="button"
      class="send-btn"
      :disabled="!canSend"
      @click="handleSend"
    >
      {{ isSending ? '发送中...' : '发送' }}
    </button>
  </footer>
</template>

<style scoped>
.chat-input {
  display: flex;
  gap: 12px;
  padding: 16px;
  border-top: 1px solid var(--color-border);
  background: var(--color-panel);
}

textarea {
  flex: 1; /* 占满剩余宽度 */
  resize: vertical; /* 只允许竖向拖大 */
  min-height: 72px;
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font: inherit;
  line-height: 1.5;
  background: var(--color-panel);
  color: var(--color-text);
}

textarea:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.send-btn {
  align-self: flex-end; /* 和输入框底部对齐 */
  padding: 8px 20px;
  border-radius: 8px;
  background: var(--color-panel);
  color: var(--color-text);
  font: inherit;
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
