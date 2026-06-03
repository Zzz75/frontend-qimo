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
  currentRole: string;
  modelName: string;
}

export type MessagesPersistState = Record<string, ChatMessage[]>;

export const storage = {
  getItem<T>(key: string, fallback: T): T {
    const rawValue = localStorage.getItem(key);
    if (!rawValue) {
      return fallback;
    }

    try {
      return JSON.parse(rawValue) as T;
    } catch {
      return fallback;
    }
  },
  setItem<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  },
  removeItem(key: string): void {
    localStorage.removeItem(key);
  }
};

const isValidSession = (item: unknown): item is SessionSummary =>
  typeof item === 'object' &&
  item !== null &&
  typeof (item as SessionSummary).id === 'string' &&
  typeof (item as SessionSummary).title === 'string' &&
  typeof (item as SessionSummary).updatedAt === 'number';

const isValidMessage = (item: unknown): item is ChatMessage =>
  typeof item === 'object' &&
  item !== null &&
  typeof (item as ChatMessage).id === 'string' &&
  typeof (item as ChatMessage).role === 'string' &&
  typeof (item as ChatMessage).content === 'string' &&
  typeof (item as ChatMessage).createdAt === 'number';

export const loadSessionState = (): SessionPersistState => {
  const fallback: SessionPersistState = { sessions: [], activeSessionId: null };
  const raw = storage.getItem<SessionPersistState>(STORAGE_KEYS.sessions, fallback);
  const sessions = Array.isArray(raw.sessions)
    ? raw.sessions.filter(isValidSession)
    : [];

  const activeSessionId =
    typeof raw.activeSessionId === 'string' &&
    sessions.some((item) => item.id === raw.activeSessionId)
      ? raw.activeSessionId
      : sessions[0]?.id ?? null;

  return { sessions, activeSessionId };
};

export const saveSessionState = (state: SessionPersistState): void => {
  storage.setItem(STORAGE_KEYS.sessions, state);
};

export const loadMessagesState = (): MessagesPersistState => {
  const raw = storage.getItem<MessagesPersistState>(STORAGE_KEYS.messages, {});
  if (!raw || typeof raw !== 'object') {
    return {};
  }

  return Object.entries(raw).reduce<MessagesPersistState>((acc, [sessionId, messages]) => {
    if (!Array.isArray(messages)) {
      return acc;
    }
    acc[sessionId] = messages.filter(isValidMessage);
    return acc;
  }, {});
};

export const saveMessagesState = (state: MessagesPersistState): void => {
  storage.setItem(STORAGE_KEYS.messages, state);
};

export const loadUiState = (): UiPersistState | null => {
  const raw = storage.getItem<Partial<UiPersistState> | null>(STORAGE_KEYS.ui, null);
  if (!raw) {
    return null;
  }

  const theme: ThemeMode = raw.theme === 'dark' ? 'dark' : 'light';
  return {
    theme,
    sidebarCollapsed: Boolean(raw.sidebarCollapsed)
  };
};

export const saveUiState = (state: UiPersistState): void => {
  storage.setItem(STORAGE_KEYS.ui, state);
};

export const loadAppPreferences = (): AppPersistState | null => {
  const raw = storage.getItem<Partial<AppPersistState> | null>(STORAGE_KEYS.app, null);
  if (!raw) {
    return null;
  }

  if (typeof raw.currentRole !== 'string' || typeof raw.modelName !== 'string') {
    return null;
  }

  return {
    currentRole: raw.currentRole,
    modelName: raw.modelName
  };
};

export const saveAppPreferences = (state: AppPersistState): void => {
  storage.setItem(STORAGE_KEYS.app, state);
};
