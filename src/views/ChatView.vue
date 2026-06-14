<!--
  聊天主页面 ChatView
  布局：顶栏 + 左侧会话栏 + 右侧（消息列表 + 输入框）
  这是用户打开网站看到的主要界面
-->

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'; // 生命周期：组件挂载/卸载时执行
import { storeToRefs } from 'pinia';           // 把 store 里的 ref 转成 ref，方便在模板里用

// 引入本页用到的子组件
import AppHeader from '@/components/common/AppHeader.vue';
import ErrorToast from '@/components/common/ErrorToast.vue';
import LoadingState from '@/components/common/LoadingState.vue';
import ChatInput from '@/components/chat/ChatInput.vue';
import MessageList from '@/components/chat/MessageList.vue';
import SessionSidebar from '@/components/session/SessionSidebar.vue';

// 引入三个 store
import { useChatStore } from '@/stores/chat';
import { useSessionStore } from '@/stores/session';
import { useUiStore } from '@/stores/ui';

const chatStore = useChatStore();
const sessionStore = useSessionStore();
const uiStore = useUiStore();

// storeToRefs：解构后仍保持响应式（直接解构会丢响应式）
const { error } = storeToRefs(chatStore);
const { isMobileDrawerOpen, globalLoading } = storeToRefs(uiStore);

/** 点击手机端遮罩层时关闭抽屉 */
const handleOverlayClick = () => {
  uiStore.closeMobileDrawer();
};

/** 按 Esc 键关闭手机端抽屉 */
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isMobileDrawerOpen.value) {
    uiStore.closeMobileDrawer();
  }
};

// 组件显示到页面上时，注册键盘监听
onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

// 组件从页面移除时，取消监听，避免内存泄漏
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
  <!-- 整页容器 -->
  <div class="chat-view">
    <!-- 顶部标题栏：菜单按钮、主题切换 -->
    <AppHeader />

    <main class="chat-layout">
      <!-- 手机端：抽屉打开时的半透明遮罩，点击可关闭 -->
      <div
        v-if="isMobileDrawerOpen"
        class="sidebar-overlay"
        aria-hidden="true"
        @click="handleOverlayClick"
      />

      <!-- 左侧会话列表；is-open 类控制手机端滑出 -->
      <SessionSidebar :class="{ 'is-open': isMobileDrawerOpen }" />

      <!-- 右侧主聊天区 -->
      <section class="chat-main">
        <!-- 全局 loading 时显示转圈，否则显示消息列表 -->
        <LoadingState v-if="globalLoading" />
        <MessageList v-else />

        <!-- 有错误时显示红色提示条 -->
        <ErrorToast
          v-if="error"
          :message="error"
          @dismiss="chatStore.clearError"
        />

        <!-- 底部输入框 -->
        <ChatInput />
      </section>
    </main>
  </div>
</template>

<style scoped>
/* scoped：这些样式只作用于本组件，不影响别的页面 */

/* 整页占满视口高度，纵向 flex 布局 */
.chat-view {
  height: 100vh;       /* 视口高度 */
  height: 100dvh;      /* 移动端动态视口，避免地址栏影响 */
  display: flex;
  flex-direction: column;
  overflow: hidden;    /* 防止整页出现滚动条 */
}

/* 主区域：左 280px 侧边栏 + 右侧自适应 */
.chat-layout {
  flex: 1;             /* 占满顶栏以外的剩余高度 */
  display: grid;
  grid-template-columns: 280px 1fr; /* 两列：固定宽 + 弹性 */
  grid-template-rows: minmax(0, 1fr);
  position: relative;
  min-height: 0;       /* 允许 grid 子项正确收缩 */
  overflow: hidden;
}

/* 右侧聊天主栏：消息区 + 输入框纵向排列 */
.chat-main {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

/* 桌面端不显示遮罩 */
.sidebar-overlay {
  display: none;
}

/* 平板/手机：侧边栏改为抽屉，显示遮罩 */
@media (max-width: 768px) {
  .chat-layout {
    grid-template-columns: 1fr; /* 只一列，侧边栏浮在上面 */
  }

  .sidebar-overlay {
    display: block;
    position: fixed;
    inset: 56px 0 0;           /* 顶栏 56px 以下铺满 */
    background: rgba(0, 0, 0, 0.4);
    z-index: 10;
  }
}
</style>
