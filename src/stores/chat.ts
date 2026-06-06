import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { createChatStream } from '@/api/chat';
import type { ChatRequestMessage } from '@/api/types';
import { useAppStore } from '@/stores/app';
import { useSessionStore } from '@/stores/session';
import type { ChatMessage } from '@/types/chat';
import { createId } from '@/utils/id';
import { loadMessagesState, saveMessagesState } from '@/utils/storage';

export const useChatStore = defineStore('chat', () => {
  const messagesBySession = ref<Record<string, ChatMessage[]>>({});
  const isSending = ref(false);
  const isStreaming = ref(false);
  const streamBuffer = ref('');
  const error = ref<string | null>(null);

  const sessionStore = useSessionStore();

  const activeMessages = computed(() =>
    messagesBySession.value[sessionStore.activeSessionId!]
  );

  const canSend = computed(
    () => !isSending.value && Boolean(sessionStore.activeSessionId)
  );

  const getSessionMessages = (sessionId: string): ChatMessage[] => {
    messagesBySession.value[sessionId] ??= [];
    return messagesBySession.value[sessionId];
  };

  const persistMessages = () => {
    saveMessagesState(messagesBySession.value);
  };

  const loadFromStorage = () => {
    messagesBySession.value = loadMessagesState();
  };

  const removeMessagesForSession = (sessionId: string) => {
    const { [sessionId]: _removed, ...rest } = messagesBySession.value;
    messagesBySession.value = rest;
    persistMessages();
  };

  const toRequestMessages = (messages: ChatMessage[]): ChatRequestMessage[] =>
    messages.map((item) => ({
      role: item.role,
      content: item.content
    }));

  const sendMessage = async (content: string) => {
    const sessionId = sessionStore.activeSessionId!;
    isSending.value = true;
    error.value = null;

    const messages = getSessionMessages(sessionId);

    messages.push({
      id: createId(),
      role: 'user',
      content: content.trim(),
      createdAt: Date.now()
    });
    sessionStore.touchSession(sessionId, messages[messages.length - 1].content);

    const assistantIndex = messages.length;
    messages.push({
      id: createId(),
      role: 'assistant',
      content: '',
      createdAt: Date.now()
    });
    isStreaming.value = true;
    streamBuffer.value = '';

    const appStore = useAppStore();
    await createChatStream(
      {
        model: appStore.modelName,
        messages: toRequestMessages(messages),
        stream: true
      },
      {
        onChunk: (chunk) => {
          // 必须通过响应式数组更新，直接改局部变量不会触发视图刷新
          messages[assistantIndex].content += chunk;
          streamBuffer.value = messages[assistantIndex].content;
        },
        onDone: () => {
          isStreaming.value = false;
          sessionStore.touchSession(sessionId);
          persistMessages();
        },
        onError: (message) => {
          error.value = message;
          isStreaming.value = false;
          persistMessages();
        }
      }
    );

    isSending.value = false;
  };

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
    clearError,
    loadFromStorage,
    removeMessagesForSession
  };
});
