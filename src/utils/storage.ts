import type { ChatMessage } from '@/types/chat';
import type { SessionSummary } from '@/types/session';
import type { ThemeMode } from '@/types/ui';

export const STORAGE_KEYS = {
  sessions: 'qimo:sessions',
  messages: 'qimo:messages',
  ui: 'qimo:ui',
  app: 'qimo:app'
} as const;

export interface SessionPersistState {
  sessions: SessionSummary[];
  activeSessionId: string | null;
}

export interface UiPersistState {
  theme: ThemeMode;
  sidebarCollapsed: boolean;
}

export interface AppPersistState {
  modelName: string;
}

export type MessagesPersistState = Record<string, ChatMessage[]>;

const EMPTY_SESSION_STATE: SessionPersistState = { sessions: [], activeSessionId: null };
const EMPTY_UI_STATE: UiPersistState = { theme: 'light', sidebarCollapsed: false };
const EMPTY_APP_STATE: AppPersistState = { modelName: 'deepseek-chat' };

export const storage = {
  getItem<T>(key: string, fallback: T): T {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  },
  setItem<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

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
