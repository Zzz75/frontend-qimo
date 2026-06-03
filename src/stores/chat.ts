import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { useSessionStore } from '@/stores/session';
import type { ChatMessage } from '@/types/chat';

export const useChatStore = defineStore('chat', () => {
  const messagesBySession = ref<Record<string, ChatMessage[]>>({});
  const isSending = ref(false);
  const isStreaming = ref(false);
  const streamBuffer = ref('');
  const error = ref<string | null>(null);

  const activeMessages = computed<ChatMessage[]>(() => {
    const sessionStore = useSessionStore();
    const sessionId = sessionStore.activeSessionId;
    if (!sessionId) return [];
    return messagesBySession.value[sessionId] ?? [];
  });

  const canSend = computed(() => {
    const sessionStore = useSessionStore();
    return !isSending.value && Boolean(sessionStore.activeSessionId);
  });

  const sendMessage = (_content: string) => {};
  const appendUserMessage = (_payload: ChatMessage) => {};
  const appendAssistantMessageChunk = (_chunk: string) => {};
  const finalizeAssistantMessage = () => {};
  const retryLastMessage = () => {};
  const clearError = () => {
    error.value = null;
  };

  return {
    messagesBySession,
    isSending,
    isStreaming,
    streamBuffer,
    error,
    activeMessages,
    canSend,
    sendMessage,
    appendUserMessage,
    appendAssistantMessageChunk,
    finalizeAssistantMessage,
    retryLastMessage,
    clearError
  };
});
