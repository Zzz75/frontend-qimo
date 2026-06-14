/**
 * 浏览器 localStorage 持久化
 * localStorage：浏览器提供的键值存储，关闭页面后数据仍在（除非用户清缓存）
 * 本项目把会话、消息、界面偏好、应用配置都存在这里
 */

import type { ChatMessage } from '@/types/chat';
import type { SessionSummary } from '@/types/session';
import type { ThemeMode } from '@/types/ui';

// 各模块在 localStorage 里用的 key 名（加前缀 qimo: 避免和其他网站冲突）
export const STORAGE_KEYS = {
    sessions: 'qimo:sessions',   // 会话列表
    messages: 'qimo:messages',   // 各会话的消息
    ui: 'qimo:ui',               // 主题、侧边栏等
    app: 'qimo:app'              // 应用配置（如模型名）
} as const;

// 会话持久化数据的形状
export interface SessionPersistState {
    sessions: SessionSummary[];       // 所有会话
    activeSessionId: string | null;   // 当前选中的会话 ID
}

// UI 持久化数据的形状
export interface UiPersistState {
    theme: ThemeMode;           // 浅色或深色
    sidebarCollapsed: boolean;  // 侧边栏是否收起
}

// 应用配置持久化数据的形状
export interface AppPersistState {
    modelName: string;  // AI 模型名称
}

// 消息：按会话 ID 分组，key 是会话 id，value 是该会话的消息数组
export type MessagesPersistState = Record<string, ChatMessage[]>;

// 读不到数据时使用的默认值（空会话、默认浅色主题等）
const EMPTY_SESSION_STATE: SessionPersistState = { sessions: [], activeSessionId: null };
const EMPTY_UI_STATE: UiPersistState = { theme: 'light', sidebarCollapsed: false };
const EMPTY_APP_STATE: AppPersistState = { modelName: 'deepseek-chat' };

// 封装 localStorage 读写，统一 JSON 序列化
export const storage = {
    /** 读取：有数据则 JSON 解析，没有则返回 fallback 默认值 */
    getItem<T>(key: string, fallback: T): T {
        const raw = localStorage.getItem(key);           // 取出字符串
        return raw ? (JSON.parse(raw) as T) : fallback;  // 解析成对象，否则用默认值
    },
    /** 写入：把对象 JSON .stringify 后存进 localStorage */
    setItem<T>(key: string, value: T): void {
        localStorage.setItem(key, JSON.stringify(value));
    }
};

// —— 以下为各模块的 load / save 快捷函数 ——

export const loadSessionState = (): SessionPersistState =>
    storage.getItem(STORAGE_KEYS.sessions, EMPTY_SESSION_STATE);

export const saveSessionState = (state: SessionPersistState): void => {
    storage.setItem(STORAGE_KEYS.sessions, state);
};

export const loadMessagesState = (): MessagesPersistState =>
    storage.getItem(STORAGE_KEYS.messages, {});

export const saveMessagesState = (state: MessagesPersistState): void => {
    storage.setItem(STORAGE_KEYS.messages, state);
};

export const loadUiState = (): UiPersistState =>
    storage.getItem(STORAGE_KEYS.ui, EMPTY_UI_STATE);

export const saveUiState = (state: UiPersistState): void => {
    storage.setItem(STORAGE_KEYS.ui, state);
};

export const loadAppPreferences = (): AppPersistState =>
    storage.getItem(STORAGE_KEYS.app, EMPTY_APP_STATE);

export const saveAppPreferences = (state: AppPersistState): void => {
    storage.setItem(STORAGE_KEYS.app, state);
};
