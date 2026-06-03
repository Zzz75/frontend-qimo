import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { createChatStream } from '@/api/chat';
import type { ChatRequestMessage } from '@/api/types';
import { useStreamResponse } from '@/composables/useStreamResponse';
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
  const pendingAssistantMessageId = ref<string | null>(null);
  const lastFailedUserContent = ref<string | null>(null);
  const streamResponse = useStreamResponse();

  const activeMessages = computed<ChatMessage[]>(() => {
    const sessionStore = useSessionStore();
    const sessionId = sessionStore.activeSessionId;
    if (!sessionId) {
      return [];
    }
    return messagesBySession.value[sessionId] ?? [];
  });

  const canSend = computed(() => {
    const sessionStore = useSessionStore();
    return !isSending.value && Boolean(sessionStore.activeSessionId);
  });

  const getSessionMessages = (sessionId: string): ChatMessage[] => {
    if (!messagesBySession.value[sessionId]) {
      messagesBySession.value[sessionId] = [];
    }
    return messagesBySession.value[sessionId];
  };

  const persistMessages = () => {
    saveMessagesState(messagesBySession.value);
  };

  const loadFromStorage = () => {
    messagesBySession.value = loadMessagesState();
  };

  const saveToStorage = () => {
    persistMessages();
  };

  const removeMessagesForSession = (sessionId: string) => {
    if (!(sessionId in messagesBySession.value)) {
      return;
    }
    const { [sessionId]: _removed, ...rest } = messagesBySession.value;
    messagesBySession.value = rest;
    persistMessages();
  };

  const appendUserMessage = (payload: ChatMessage) => {
    const sessionStore = useSessionStore();
    const sessionId = sessionStore.activeSessionId;
    if (!sessionId) {
      return;
    }

    const messages = getSessionMessages(sessionId);
    messages.push(payload);
    sessionStore.touchSession(sessionId, payload.content);
    persistMessages();
  };

  const beginAssistantMessage = (): string | null => {
    const sessionStore = useSessionStore();
    const sessionId = sessionStore.activeSessionId;
    if (!sessionId) {
      return null;
    }

    const assistantMessage: ChatMessage = {
      id: createId(),
      role: 'assistant',
      content: '',
      createdAt: Date.now()
    };

    getSessionMessages(sessionId).push(assistantMessage);
    pendingAssistantMessageId.value = assistantMessage.id;
    isStreaming.value = true;
    streamBuffer.value = streamResponse.resetStream();
    return assistantMessage.id;
  };

  const appendAssistantMessageChunk = (chunk: string) => {
    if (!chunk) {
      return;
    }

    const sessionStore = useSessionStore();
    const sessionId = sessionStore.activeSessionId;
    const messageId = pendingAssistantMessageId.value;
    if (!sessionId || !messageId) {
      return;
    }

    const message = getSessionMessages(sessionId).find((item) => item.id === messageId);
    if (!message) {
      return;
    }

    const nextBuffer = streamResponse.appendChunk(chunk);
    message.content = nextBuffer;
    streamBuffer.value = nextBuffer;
  };

  const finalizeAssistantMessage = () => {
    const sessionStore = useSessionStore();
    const sessionId = sessionStore.activeSessionId;
    const messageId = pendingAssistantMessageId.value;

    if (sessionId && messageId) {
      const message = getSessionMessages(sessionId).find((item) => item.id === messageId);
      if (message?.content.trim()) {
        sessionStore.touchSession(sessionId);
      }
    }

    isStreaming.value = false;
    streamResponse.finalizeStream();
    streamBuffer.value = '';
    pendingAssistantMessageId.value = null;
    lastFailedUserContent.value = null;
    persistMessages();
  };

  const removeIncompleteAssistantMessage = () => {
    const sessionStore = useSessionStore();
    const sessionId = sessionStore.activeSessionId;
    const messageId = pendingAssistantMessageId.value;
    if (!sessionId || !messageId) {
      return;
    }

    const messages = getSessionMessages(sessionId);
    const targetIndex = messages.findIndex((item) => item.id === messageId);
    if (targetIndex === -1) {
      return;
    }

    const target = messages[targetIndex];
    if (!target.content.trim()) {
      messages.splice(targetIndex, 1);
    }
  };

  const rollbackSendingState = () => {
    removeIncompleteAssistantMessage();
    isStreaming.value = false;
    streamResponse.resetStream();
    streamBuffer.value = '';
    pendingAssistantMessageId.value = null;
    persistMessages();
  };

  const toRequestMessages = (messages: ChatMessage[]): ChatRequestMessage[] =>
    messages
      .filter((item) => item.content.trim().length > 0)
      .map((item) => ({
        role: item.role,
        content: item.content
      }));

  const handleStreamError = (message: string) => {
    error.value = message;
    rollbackSendingState();
  };

  const requestAssistantStream = async (sessionId: string): Promise<boolean> => {
    const appStore = useAppStore();
    beginAssistantMessage();

    const requestMessages = toRequestMessages(getSessionMessages(sessionId));
    let streamFinished = false;
    let streamSucceeded = false;

    try {
      await createChatStream(
        {
          model: appStore.modelName,
          messages: requestMessages,
          stream: true
        },
        {
          onChunk: appendAssistantMessageChunk,
          onDone: () => {
            streamFinished = true;
            streamSucceeded = true;
            finalizeAssistantMessage();
          },
          onError: (message) => {
            streamFinished = true;
            streamSucceeded = false;
            handleStreamError(message);
          }
        }
      );
    } catch (streamError) {
      const message =
        streamError instanceof Error ? streamError.message : '消息发送失败，请稍后重试';
      handleStreamError(message);
      return false;
    }

    if (streamFinished) {
      return streamSucceeded;
    }

    const assistantMessage = getSessionMessages(sessionId).find(
      (item) => item.id === pendingAssistantMessageId.value
    );
    if (assistantMessage?.content.trim()) {
      finalizeAssistantMessage();
      return true;
    }

    handleStreamError('流式响应未完成，请稍后重试');
    return false;
  };

  const sendMessage = async (content: string) => {
    const trimmedContent = content.trim();
    if (!trimmedContent || isSending.value) {
      return;
    }

    const sessionStore = useSessionStore();
    const sessionId = sessionStore.activeSessionId;
    if (!sessionId) {
      return;
    }

    clearError();
    isSending.value = true;
    lastFailedUserContent.value = trimmedContent;

    const userMessage: ChatMessage = {
      id: createId(),
      role: 'user',
      content: trimmedContent,
      createdAt: Date.now()
    };
    appendUserMessage(userMessage);

    try {
      await requestAssistantStream(sessionId);
    } finally {
      isSending.value = false;
    }
  };

  const retryLastMessage = async () => {
    if (isSending.value) {
      return;
    }

    const sessionStore = useSessionStore();
    const sessionId = sessionStore.activeSessionId;
    const content = lastFailedUserContent.value;
    if (!sessionId || !content) {
      return;
    }

    clearError();
    isSending.value = true;

    try {
      await requestAssistantStream(sessionId);
    } finally {
      isSending.value = false;
    }
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
    appendUserMessage,
    appendAssistantMessageChunk,
    finalizeAssistantMessage,
    retryLastMessage,
    clearError,
    loadFromStorage,
    saveToStorage,
    removeMessagesForSession
  };
});
