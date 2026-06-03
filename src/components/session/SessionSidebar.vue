<script setup lang="ts">
import { storeToRefs } from 'pinia';

import EmptyState from '@/components/common/EmptyState.vue';
import { useSessionStore } from '@/stores/session';
import NewSessionButton from './NewSessionButton.vue';
import SessionItem from './SessionItem.vue';

const sessionStore = useSessionStore();
const { sessions, activeSessionId } = storeToRefs(sessionStore);
</script>

<template>
  <aside class="session-sidebar" aria-label="会话侧边栏">
    <NewSessionButton />
    <nav v-if="sessions.length > 0" class="session-list">
      <SessionItem
        v-for="session in sessions"
        :key="session.id"
        :title="session.title"
        :active="session.id === activeSessionId"
        @select="sessionStore.switchSession(session.id)"
      />
    </nav>
    <EmptyState v-else class="session-empty" message="暂无会话，点击上方按钮创建" />
  </aside>
</template>

<style scoped>
.session-sidebar {
  border-right: 1px solid var(--color-border);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: var(--color-panel);
  min-height: 0;
  overflow: auto;
}

.session-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.session-empty {
  flex: unset;
  padding: 24px 0;
  font-size: 13px;
}

@media (max-width: 768px) {
  .session-sidebar {
    position: fixed;
    top: 56px;
    left: 0;
    bottom: 0;
    width: min(280px, 85vw);
    z-index: 20;
    transform: translateX(-100%);
    transition: transform 0.25s ease;
    box-shadow: none;
  }

  .session-sidebar.is-open {
    transform: translateX(0);
    box-shadow: 4px 0 16px rgba(0, 0, 0, 0.12);
  }
}
</style>
