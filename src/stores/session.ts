/**
 * 会话 Store
 * 管理：会话列表、当前选中会话、新建/切换/删除会话
 * 侧边栏 SessionSidebar 主要读写这里的数据
 */

import { defineStore } from 'pinia';
import { computed, ref } from 'vue'; // computed：根据其他数据算出来的只读值

import { useChatStore } from '@/stores/chat';
import { useUiStore } from '@/stores/ui';
import type { SessionSummary } from '@/types/session';
import { createId } from '@/utils/id';
import { loadSessionState, saveSessionState } from '@/utils/storage';

const DEFAULT_SESSION_TITLE = '新会话';      // 新建会话的默认标题
const SESSION_TITLE_MAX_LENGTH = 24;         // 自动标题最大字数

/** 用用户首条消息内容截断生成会话标题 */
const truncateTitle = (content: string): string => {
    const normalized = content.replace(/\s+/g, ' ').trim(); // 多个空白压成一个空格 .trim() 去掉首尾空格
    return normalized.length > SESSION_TITLE_MAX_LENGTH
        ? `${normalized.slice(0, SESSION_TITLE_MAX_LENGTH)}…` // 超长加省略号
        : normalized;
};

export const useSessionStore = defineStore('session', () => {
    const sessions = ref<SessionSummary[]>([]);     // 创建一个可以响应式更新的会话空数组
    const activeSessionId = ref<string | null>(null); // 创建一个响应式string变量

    // 根据 activeSessionId 从列表里找到当前会话对象
    // 只要这两个依赖变了，computed 会自动重新计算 activeSession 的值，界面也会更新
    // ！作用：断言它一定存在
    const activeSession = computed(() =>
        sessions.value.find((item) => item.id === activeSessionId.value)!
    );

    /** 把会话列表和当前选中 ID 存进 localStorage */
    const persist = () => {
        saveSessionState({
            sessions: sessions.value,
            activeSessionId: activeSessionId.value
        });
    };

    /**
     * 更新会话的「最后活动时间」，列表按时间排序
     * 若传入 titleSource 且标题还是「新会话」，则用首条消息自动改名
     */
    const touchSession = (sessionId: string, titleSource?: string) => {
        const session = sessions.value.find((item) => item.id === sessionId)!;

        if (titleSource && session.title === DEFAULT_SESSION_TITLE) {
            session.title = truncateTitle(titleSource);
        }

        // 当前会话的更新时间改成“现在”
        session.updatedAt = Date.now();
        // 复制数组再排序，确保 Vue 检测到变化并刷新界面
        // 按更新时间从新到旧排
        sessions.value = [...sessions.value].sort((a, b) => b.updatedAt - a.updatedAt);
        persist();
    };

    /** 新建一个空会话并设为当前会话 */
    const createSession = () => {
        const now = Date.now();
        const session: SessionSummary = {
            id: createId(),
            title: DEFAULT_SESSION_TITLE,
            updatedAt: now
        };

        sessions.value.unshift(session);        // 插到列表最前面
        activeSessionId.value = session.id;
        persist();
        useUiStore().closeMobileDrawer();       // 手机上新建后关掉抽屉
    };

    /** 批量删除会话，并同步删掉对应聊天消息 */
    const deleteSessions = (sessionIds: string[]) => {
        const targetIds = new Set(sessionIds);
        sessions.value = sessions.value.filter((item) => !targetIds.has(item.id));

        const chatStore = useChatStore();
        sessionIds.forEach((id) => chatStore.removeMessagesForSession(id));

        // 若删的是当前会话，自动选中列表里第一个
        activeSessionId.value = sessions.value[0]?.id ?? null;
        persist();
    };

    /** 删除单个会话（内部调 deleteSessions） */
    const deleteSession = (sessionId: string) => {
        deleteSessions([sessionId]);
    };

    /** 切换到指定会话 */
    const switchSession = (sessionId: string) => {
        activeSessionId.value = sessionId;
        persist();
        useUiStore().closeMobileDrawer();
    };

    /** 启动时从 localStorage 恢复 */
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
