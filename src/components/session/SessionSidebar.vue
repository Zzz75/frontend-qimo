<!--
  会话侧边栏 SessionSidebar
  左侧：新建会话、会话列表、批量删除、删除确认弹窗
-->

<script setup lang="ts">
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';

import { useSessionStore } from '@/stores/session';
import NewSessionButton from './NewSessionButton.vue';
import SessionDeleteDialog from './SessionDeleteDialog.vue';
import SessionItem from './SessionItem.vue';

// 删除弹窗的三种模式：删一个 / 删选中 / 删全部
type DeleteDialogMode = 'single' | 'batch' | 'all';

const sessionStore = useSessionStore();
const { sessions, activeSessionId } = storeToRefs(sessionStore);

const isBatchMode = ref(false);              // 是否处于批量勾选模式
const selectedSessionIds = ref<string[]>([]); // 批量模式下勾选的会话 id 列表
const dialogOpen = ref(false);               // 删除确认弹窗是否打开
const dialogMode = ref<DeleteDialogMode>('single');
const pendingSessionId = ref<string | null>(null); // 单个删除时待删的会话 id

const selectedCount = computed(() => selectedSessionIds.value.length);
const hasSessions = computed(() => sessions.value.length > 0);
const allSelected = computed(
  () => hasSessions.value && selectedCount.value === sessions.value.length
);

const pendingSession = computed(() =>
  sessions.value.find((item) => item.id === pendingSessionId.value) ?? null
);

// 根据删除模式动态生成弹窗标题和说明
const dialogTitle = computed(() => {
  if (dialogMode.value === 'all') {
    return '删除全部会话';
  }
  if (dialogMode.value === 'batch') {
    return '删除所选会话';
  }
  return '删除会话';
});

const dialogDescription = computed(() => {
  if (dialogMode.value === 'all') {
    return `确认删除全部 ${sessions.value.length} 个会话吗？删除后无法恢复。`;
  }
  if (dialogMode.value === 'batch') {
    return `确认删除已选中的 ${selectedCount.value} 个会话吗？删除后无法恢复。`;
  }
  const title = pendingSession.value?.title ?? '该会话';
  return `确认删除会话「${title}」吗？删除后无法恢复。`;
});

const clearSelection = () => {
  selectedSessionIds.value = [];
};

const closeDialog = () => {
  dialogOpen.value = false;
  pendingSessionId.value = null;
};

/** 打开「删除单个会话」确认框 */
const openSingleDeleteDialog = (sessionId: string) => {
  pendingSessionId.value = sessionId;
  dialogMode.value = 'single';
  dialogOpen.value = true;
};

/** 打开「删除所选」确认框 */
const openBatchDeleteDialog = () => {
  dialogMode.value = 'batch';
  dialogOpen.value = true;
};

/** 打开「删除全部」确认框 */
const openDeleteAllDialog = () => {
  dialogMode.value = 'all';
  dialogOpen.value = true;
};

/** 用户在弹窗里点确认后，按模式调用 store 删除 */
const confirmDelete = () => {
  if (dialogMode.value === 'single') {
    sessionStore.deleteSession(pendingSessionId.value!);
  } else if (dialogMode.value === 'batch') {
    sessionStore.deleteSessions(selectedSessionIds.value);
    clearSelection();
  } else {
    sessionStore.deleteSessions(sessions.value.map((session) => session.id));
    clearSelection();
    isBatchMode.value = false;
  }
  closeDialog();
};

/** 进入/退出批量管理模式 */
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

</script>

<template>
  <aside class="session-sidebar" aria-label="会话侧边栏">
    <header class="session-sidebar__header">
      <NewSessionButton />
      <button
        v-if="hasSessions"
        type="button"
        class="toolbar-btn"
        :class="{ 'is-active': isBatchMode }"
        @click="toggleBatchMode"
      >
        {{ isBatchMode ? '完成' : '批量管理' }}
      </button>
    </header>

    <!-- 批量模式工具栏 -->
    <section v-if="hasSessions && isBatchMode" class="batch-toolbar">
      <div class="batch-toolbar__row">
        <button type="button" class="toolbar-btn" @click="toggleSelectAll">
          {{ allSelected ? '取消全选' : '全选' }}
        </button>
        <span class="batch-toolbar__count">已选 {{ selectedCount }} / {{ sessions.length }}</span>
      </div>
      <div class="batch-toolbar__row batch-toolbar__row--danger">
        <button
          type="button"
          class="toolbar-btn is-danger"
          :disabled="selectedCount === 0"
          @click="openBatchDeleteDialog"
        >
          删除所选
        </button>
        <button type="button" class="toolbar-btn is-danger-outline" @click="openDeleteAllDialog">
          删除全部
        </button>
      </div>
    </section>

    <div class="session-sidebar__body">
      <nav v-if="hasSessions" class="session-list" aria-label="会话列表">
        <div
          v-for="session in sessions"
          :key="session.id"
          class="session-row"
          :class="{ 'is-batch': isBatchMode }"
        >
          <label v-if="isBatchMode" class="selection-checkbox">
            <input
              type="checkbox"
              :checked="selectedSessionIds.includes(session.id)"
              :aria-label="`选择会话 ${session.title}`"
              @change="toggleSelectSession(session.id)"
            />
          </label>
          <SessionItem
            :title="session.title"
            :active="session.id === activeSessionId"
            :show-menu="!isBatchMode"
            @select="sessionStore.switchSession(session.id)"
            @manage="openSingleDeleteDialog(session.id)"
          />
        </div>
      </nav>
      <p v-else class="session-empty" role="status">当前无会话</p>
    </div>

    <SessionDeleteDialog
      :open="dialogOpen"
      :title="dialogTitle"
      :description="dialogDescription"
      @close="closeDialog"
      @confirm="confirmDelete"
    />
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
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.session-sidebar__header {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
}

.session-sidebar__body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior: contain;
}

.session-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.batch-toolbar {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
  border-radius: 10px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  flex-shrink: 0;
}

.batch-toolbar__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}

.batch-toolbar__row--danger {
  padding-top: 4px;
  border-top: 1px solid var(--color-border);
}

.batch-toolbar__count {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.toolbar-btn {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: transparent;
  color: var(--color-text);
  font: inherit;
  font-size: 13px;
  padding: 7px 12px;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.toolbar-btn:hover:not(:disabled) {
  background: var(--color-bg);
}

.toolbar-btn.is-active {
  border-color: var(--color-text);
  background: var(--color-bg);
  font-weight: 600;
}

.toolbar-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.toolbar-btn.is-danger {
  color: #fff;
  background: #d93025;
  border-color: #d93025;
}

.toolbar-btn.is-danger:hover:not(:disabled) {
  background: #c5221f;
  border-color: #c5221f;
}

.toolbar-btn.is-danger-outline {
  color: #d93025;
  border-color: color-mix(in srgb, #d93025 45%, var(--color-border));
}

.toolbar-btn.is-danger-outline:hover:not(:disabled) {
  background: color-mix(in srgb, #d93025 10%, transparent);
}

.session-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.session-row.is-batch {
  padding: 2px 0;
}

.selection-checkbox {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
}

.selection-checkbox input {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.session-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 24px 16px;
  text-align: center;
  font-size: 14px;
  color: var(--color-text-secondary);
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
