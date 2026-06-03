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
  if (!normalized) {
    return DEFAULT_SESSION_TITLE;
  }
  return normalized.length > SESSION_TITLE_MAX_LENGTH
    ? `${normalized.slice(0, SESSION_TITLE_MAX_LENGTH)}…`
    : normalized;
};

export const useSessionStore = defineStore('session', () => {
  const sessions = ref<SessionSummary[]>([]);
  const activeSessionId = ref<string | null>(null);

  const activeSession = computed(() =>
    sessions.value.find((item) => item.id === activeSessionId.value) ?? null
  );

  const persist = () => {
    saveSessionState({
      sessions: sessions.value,
      activeSessionId: activeSessionId.value
    });
  };

  const touchSession = (sessionId: string, titleSource?: string) => {
    const session = sessions.value.find((item) => item.id === sessionId);
    if (!session) {
      return;
    }

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
    return session.id;
  };

  const deleteSessions = (sessionIds: string[]) => {
    const uniqueIds = Array.from(new Set(sessionIds));
    if (uniqueIds.length === 0) {
      return;
    }

    const targetIds = new Set(uniqueIds);
    const nextSessions = sessions.value.filter((item) => !targetIds.has(item.id));
    if (nextSessions.length === sessions.value.length) {
      return;
    }

    sessions.value = nextSessions;
    const chatStore = useChatStore();
    uniqueIds.forEach((id) => {
      chatStore.removeMessagesForSession(id);
    });

    if (!activeSessionId.value || targetIds.has(activeSessionId.value)) {
      activeSessionId.value = sessions.value[0]?.id ?? null;
      if (!activeSessionId.value && sessions.value.length === 0) {
        createSession();
        return;
      }
    }

    persist();
  };

  const deleteSession = (sessionId: string) => {
    deleteSessions([sessionId]);
  };

  const switchSession = (sessionId: string) => {
    if (!sessions.value.some((item) => item.id === sessionId)) {
      return;
    }
    activeSessionId.value = sessionId;
    persist();
    useUiStore().closeMobileDrawer();
  };

  const loadFromStorage = () => {
    const persisted = loadSessionState();
    sessions.value = persisted.sessions;
    activeSessionId.value = persisted.activeSessionId;
  };

  const saveToStorage = () => {
    persist();
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
    loadFromStorage,
    saveToStorage
  };
});
