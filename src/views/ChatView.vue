<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';

import AppHeader from '@/components/common/AppHeader.vue';
import ErrorToast from '@/components/common/ErrorToast.vue';
import LoadingState from '@/components/common/LoadingState.vue';
import ChatInput from '@/components/chat/ChatInput.vue';
import MessageList from '@/components/chat/MessageList.vue';
import SessionSidebar from '@/components/session/SessionSidebar.vue';
import { useChatStore } from '@/stores/chat';
import { useSessionStore } from '@/stores/session';
import { useUiStore } from '@/stores/ui';

const chatStore = useChatStore();
const sessionStore = useSessionStore();
const uiStore = useUiStore();

const { error } = storeToRefs(chatStore);
const { isMobileDrawerOpen, globalLoading } = storeToRefs(uiStore);

const handleOverlayClick = () => {
  uiStore.closeMobileDrawer();
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isMobileDrawerOpen.value) {
    uiStore.closeMobileDrawer();
  }
};

onMounted(() => {
  if (sessionStore.sessions.length === 0) {
    sessionStore.createSession();
  }
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
  <div class="chat-view">
    <AppHeader />
    <main class="chat-layout">
      <div
        v-if="isMobileDrawerOpen"
        class="sidebar-overlay"
        aria-hidden="true"
        @click="handleOverlayClick"
      />
      <SessionSidebar :class="{ 'is-open': isMobileDrawerOpen }" />
      <section class="chat-main">
        <LoadingState v-if="globalLoading" />
        <MessageList v-else />
        <ErrorToast
          v-if="error"
          :message="error"
          @dismiss="chatStore.clearError"
        />
        <ChatInput />
      </section>
    </main>
  </div>
</template>

<style scoped>
.chat-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.chat-layout {
  flex: 1;
  display: grid;
  grid-template-columns: 280px 1fr;
  position: relative;
  min-height: 0;
}

.chat-main {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}

.sidebar-overlay {
  display: none;
}

@media (max-width: 768px) {
  .chat-layout {
    grid-template-columns: 1fr;
  }

  .sidebar-overlay {
    display: block;
    position: fixed;
    inset: 56px 0 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 10;
  }
}
</style>
