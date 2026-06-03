import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { useUiStore } from '@/stores/ui';
import type { SessionSummary } from '@/types/session';
import { createId } from '@/utils/id';

export const useSessionStore = defineStore('session', () => {
  const sessions = ref<SessionSummary[]>([]);
  const activeSessionId = ref<string | null>(null);

  const activeSession = computed(() =>
    sessions.value.find((item) => item.id === activeSessionId.value) ?? null
  );

  const createSession = () => {
    const now = Date.now();
    const session: SessionSummary = {
      id: createId(),
      title: '新会话',
      updatedAt: now
    };
    sessions.value.unshift(session);
    activeSessionId.value = session.id;
    useUiStore().closeMobileDrawer();
    return session.id;
  };

  const deleteSession = (_sessionId: string) => {};
  const switchSession = (sessionId: string) => {
    if (!sessions.value.some((item) => item.id === sessionId)) return;
    activeSessionId.value = sessionId;
    useUiStore().closeMobileDrawer();
  };
  const loadFromStorage = () => {};
  const saveToStorage = () => {};

  return {
    sessions,
    activeSessionId,
    activeSession,
    createSession,
    deleteSession,
    switchSession,
    loadFromStorage,
    saveToStorage
  };
});
