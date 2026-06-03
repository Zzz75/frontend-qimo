<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';

import EmptyState from '@/components/common/EmptyState.vue';
import { useSessionStore } from '@/stores/session';
import NewSessionButton from './NewSessionButton.vue';
import SessionItem from './SessionItem.vue';

const sessionStore = useSessionStore();
const { sessions, activeSessionId } = storeToRefs(sessionStore);

const isBatchMode = ref(false);
const selectedSessionIds = ref<string[]>([]);

const selectedCount = computed(() => selectedSessionIds.value.length);
const hasSessions = computed(() => sessions.value.length > 0);
const allSelected = computed(
  () => hasSessions.value && selectedCount.value === sessions.value.length
);

const clearSelection = () => {
  selectedSessionIds.value = [];
};

const toggleBatchMode = () => {
  isBatchMode.value = !isBatchMode.value;
  if (!isBatchMode.value) {
    clearSelection();
  }
};

const toggleSelectSession = (sessionId: string) => {
  const exists = selectedSessionIds.value.includes(sessionId);
  selectedSessionIds.value = exists
    ? selectedSessionIds.value.filter((id) => id !== sessionId)
    : [...selectedSessionIds.value, sessionId];
};

const toggleSelectAll = () => {
  if (allSelected.value) {
    clearSelection();
    return;
  }
  selectedSessionIds.value = sessions.value.map((session) => session.id);
};

const handleDeleteSession = (sessionId: string) => {
  const target = sessions.value.find((item) => item.id === sessionId);
  if (!target) {
    return;
  }

  const confirmed = window.confirm(`确认删除会话「${target.title}」吗？`);
  if (!confirmed) {
    return;
  }
  sessionStore.deleteSession(sessionId);
};

const handleDeleteSelected = () => {
  if (selectedCount.value === 0) {
    return;
  }

  const confirmed = window.confirm(`确认删除已选中的 ${selectedCount.value} 个会话吗？`);
  if (!confirmed) {
    return;
  }
  sessionStore.deleteSessions(selectedSessionIds.value);
  clearSelection();
};

watch(
  sessions,
  (nextSessions) => {
    if (!isBatchMode.value) {
      return;
    }

    const validIds = new Set(nextSessions.map((session) => session.id));
    selectedSessionIds.value = selectedSessionIds.value.filter((id) => validIds.has(id));

    if (nextSessions.length === 0) {
      isBatchMode.value = false;
    }
  },
  { deep: true }
);
</script>

<template>
  <aside class="session-sidebar" aria-label="会话侧边栏">
    <NewSessionButton />
    <section v-if="sessions.length > 0" class="session-actions">
      <button type="button" class="action-btn" @click="toggleBatchMode">
        {{ isBatchMode ? '取消批量' : '批量删除' }}
      </button>
      <template v-if="isBatchMode">
        <button type="button" class="action-btn" @click="toggleSelectAll">
          {{ allSelected ? '取消全选' : '全选' }}
        </button>
        <button
          type="button"
          class="action-btn is-danger"
          :disabled="selectedCount === 0"
          @click="handleDeleteSelected"
        >
          删除所选 ({{ selectedCount }})
        </button>
      </template>
    </section>
    <nav v-if="sessions.length > 0" class="session-list" aria-label="会话列表">
      <div v-for="session in sessions" :key="session.id" class="session-row">
        <label v-if="isBatchMode" class="selection-checkbox">
          <input
            type="checkbox"
            :checked="selectedSessionIds.includes(session.id)"
            :aria-label="`选择会话 ${session.title}`"
            @change="toggleSelectSession(session.id)"
          />
        </label>
        <SessionItem
          class="session-row-item"
          :title="session.title"
          :active="session.id === activeSessionId"
          @select="sessionStore.switchSession(session.id)"
        />
        <button
          type="button"
          class="delete-btn"
          :aria-label="`删除会话 ${session.title}`"
          @click="handleDeleteSession(session.id)"
        >
          删除
        </button>
      </div>
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

.session-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.action-btn {
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: transparent;
  color: var(--color-text);
  font: inherit;
  font-size: 12px;
  padding: 6px 10px;
  cursor: pointer;
}

.action-btn:hover:not(:disabled) {
  background: var(--color-bg);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn.is-danger {
  color: #d93025;
  border-color: color-mix(in srgb, #d93025 40%, var(--color-border));
}

.session-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.selection-checkbox {
  display: inline-flex;
  align-items: center;
}

.selection-checkbox input {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.session-row-item {
  flex: 1;
  min-width: 0;
}

.delete-btn {
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: transparent;
  color: #d93025;
  font: inherit;
  font-size: 12px;
  line-height: 1;
  padding: 8px 10px;
  cursor: pointer;
}

.delete-btn:hover {
  background: color-mix(in srgb, #d93025 12%, transparent);
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
