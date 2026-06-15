/**
 * 聊天 Store
 * 管理：各会话的消息列表、发送消息、接收 AI 流式回复、错误状态
 * ChatInput、MessageList 等组件主要用这个 store
 */

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
  // 按会话 ID 存消息：{ "会话id1": [消息1, 消息2], "会话id2": [...] }
  const messagesBySession = ref<Record<string, ChatMessage[]>>({});
  const isSending = ref(false);    // 是否正在等待/发送请求
  const isStreaming = ref(false);  // AI 是否正在流式输出
  const streamBuffer = ref('');    // 当前流式内容的副本，供 watch 触发滚动
  const error = ref<string | null>(null); // 最近一次错误信息，null 表示无错误

  const sessionStore = useSessionStore(); // 需要知道「当前是哪个会话」

  // 当前选中会话的消息列表（可能 undefined，若该会话还没有消息）
  const activeMessages = computed(() =>
    messagesBySession.value[sessionStore.activeSessionId!]
  );

  // 能否发送：不在发送中 且 已选中某个会话
  const canSend = computed(
    () => !isSending.value && Boolean(sessionStore.activeSessionId)
  );

  /** 取某会话的消息数组；没有则创建空数组 */
  const getSessionMessages = (sessionId: string): ChatMessage[] => {
    messagesBySession.value[sessionId] ??= [];
    return messagesBySession.value[sessionId];
  };

  /** 把所有会话的消息写入 localStorage */
  const persistMessages = () => {
    saveMessagesState(messagesBySession.value);
  };

  /** 启动时从 localStorage 恢复全部消息 */
  const loadFromStorage = () => {
    messagesBySession.value = loadMessagesState();
  };

  /** 删除某会话时，从消息表里去掉对应 key */
  const removeMessagesForSession = (sessionId: string) => {
    const { [sessionId]: _removed, ...rest } = messagesBySession.value;
    messagesBySession.value = rest;
    persistMessages();
  };

  /** 转成 API 需要的格式（去掉 id、createdAt 等前端字段） */
  const toRequestMessages = (messages: ChatMessage[]): ChatRequestMessage[] =>
    messages.map((item) => ({
      role: item.role,
      content: item.content
    }));

  /**
   * 发送用户消息的核心流程：
   * 1. 追加用户消息  2. 占位一条空的 AI 消息  3. 调流式 API 逐块填充  4. 保存
   */
  const sendMessage = async (content: string) => {
    const sessionId = sessionStore.activeSessionId!;
    const trimmedContent = content.trim();
    isSending.value = true;
    error.value = null;

    const messages = getSessionMessages(sessionId);
    const previousMessages = [...messages];

    const rollbackCurrentSend = (message: string) => {
      messagesBySession.value[sessionId] = previousMessages;
      error.value = message;
      isStreaming.value = false;
      streamBuffer.value = '';
      persistMessages();
    };

    // 步骤 1：追加用户消息
    messages.push({
      id: createId(),
      role: 'user',
      content: trimmedContent,
      createdAt: Date.now()
    });

    // 步骤 2：先插一条空的 assistant 消息，后面流式往里填 content
    const assistantIndex = messages.length;
    messages.push({
      id: createId(),
      role: 'assistant',
      content: '',
      createdAt: Date.now()
    });
    isStreaming.value = true;

    const appStore = useAppStore();
    try {
      // 步骤 3：调用流式 API
      await createChatStream(
        {
          model: appStore.modelName,
          messages: toRequestMessages(messages),
          stream: true
        },
        {
          onChunk: (chunk) => {
            // 必须改 messages 数组里的对象，界面才会跟着更新
            messages[assistantIndex].content += chunk;
            streamBuffer.value = messages[assistantIndex].content;
          },
          onDone: () => {
            isStreaming.value = false;
            // 请求成功后再更新会话，失败回滚时不污染标题和最近时间
            sessionStore.touchSession(sessionId, trimmedContent);
            persistMessages();
          },
          onError: (message) => {
            rollbackCurrentSend(message);
          }
        }
      );
    } catch {
      rollbackCurrentSend('消息发送失败，请稍后重试');
    } finally {
      isSending.value = false;
    }
  };

  /** 关闭错误提示条 */
  const clearError = () => {
    error.value = null;
  };

  return {
    messagesBySession,
    isSending,
    isStreaming,
    error,
    activeMessages,
    canSend,
    sendMessage,
    clearError,
    loadFromStorage,
    removeMessagesForSession
  };
});
