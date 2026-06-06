import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { useChatStore } from '@/stores/chat';
import { useUiStore } from '@/stores/ui';
import type { SessionSummary } from '@/types/session';
import { createId } from '@/utils/id';
import { loadSessionState, saveSessionState } from '@/utils/storage';

const DEFAULT_SESSION_TITLE = '新会话';
const SESSION_TITLE_MAX_LENGTH = 24;

const truncateTitle = (content: string): string => {
  const normalized = content.replace(/\s+/g, ' ').trim();
  return normalized.length > SESSION_TITLE_MAX_LENGTH
    ? `${normalized.slice(0, SESSION_TITLE_MAX_LENGTH)}…`
    : normalized;
};

export const useSessionStore = defineStore('session', () => {
  const sessions = ref<SessionSummary[]>([]);
  const activeSessionId = ref<string | null>(null);

  const activeSession = computed(() =>
    sessions.value.find((item) => item.id === activeSessionId.value)!
  );

  const persist = () => {
    saveSessionState({
      sessions: sessions.value,
      activeSessionId: activeSessionId.value
    });
  };

  const touchSession = (sessionId: string, titleSource?: string) => {
    const session = sessions.value.find((item) => item.id === sessionId)!;

    if (titleSource && session.title === DEFAULT_SESSION_TITLE) {
      session.title = truncateTitle(titleSource);
    }

    session.updatedAt = Date.now();
    sessions.value = [...sessions.value].sort((a, b) => b.updatedAt - a.updatedAt);
    persist();
  };

  const createSession = () => {
    const now = Date.now();
    const session: SessionSummary = {
      id: createId(),
      title: DEFAULT_SESSION_TITLE,
      updatedAt: now
    };

    sessions.value.unshift(session);
    activeSessionId.value = session.id;
    persist();
    useUiStore().closeMobileDrawer();
  };

  const deleteSessions = (sessionIds: string[]) => {
    const targetIds = new Set(sessionIds);
    sessions.value = sessions.value.filter((item) => !targetIds.has(item.id));

    const chatStore = useChatStore();
    sessionIds.forEach((id) => chatStore.removeMessagesForSession(id));

    activeSessionId.value = sessions.value[0]?.id ?? null;
    persist();
  };

  const deleteSession = (sessionId: string) => {
    deleteSessions([sessionId]);
  };

  const switchSession = (sessionId: string) => {
    activeSessionId.value = sessionId;
    persist();
    useUiStore().closeMobileDrawer();
  };

  const loadFromStorage = () => {
    const persisted = loadSessionState();
    sessions.value = persisted.sessions;
    activeSessionId.value = persisted.activeSessionId;
  };

  return {
    sessions,
    activeSessionId,
    activeSession,
    createSession,
    deleteSession,
    deleteSessions,
    switchSession,
    touchSession,
    loadFromStorage
  };
});
