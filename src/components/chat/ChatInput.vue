<script setup lang="ts">
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';

import { useChatStore } from '@/stores/chat';

const chatStore = useChatStore();
const { canSend, isSending } = storeToRefs(chatStore);

const draft = ref('');
const textareaRef = ref<HTMLTextAreaElement | null>(null);

const isEmpty = computed(() => draft.value.trim().length === 0);
const isDisabled = computed(() => !canSend.value || isEmpty.value);

const handleSend = async () => {
  const content = draft.value.trim();
  if (!content || isDisabled.value) return;

  draft.value = '';
  await chatStore.sendMessage(content);
  textareaRef.value?.focus();
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key !== 'Enter' || event.shiftKey || event.isComposing) return;
  event.preventDefault();
  handleSend();
};
</script>

<template>
  <footer class="chat-input">
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
      :disabled="isDisabled"
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
  flex: 1;
  resize: vertical;
  min-height: 72px;
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font: inherit;
  line-height: 1.5;
}

textarea:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.send-btn {
  align-self: flex-end;
  padding: 8px 20px;
  border: none;
  border-radius: 8px;
  background: var(--color-text);
  color: var(--color-panel);
  font: inherit;
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
