import { defineStore } from 'pinia';
import { ref } from 'vue';

import type { RoleOption } from '@/types/chat';
import { loadAppPreferences, saveAppPreferences } from '@/utils/storage';

const DEFAULT_ROLE_OPTIONS: RoleOption[] = [
  {
    id: 'default',
    label: '通用助手',
    description: '默认 AI 助手角色'
  }
];

export const useAppStore = defineStore('app', () => {
  const currentRole = ref('default');
  const availableRoles = ref<RoleOption[]>(DEFAULT_ROLE_OPTIONS);
  const apiBaseUrl = ref(import.meta.env.VITE_API_BASE_URL);
  const apiKey = ref(import.meta.env.VITE_API_KEY);
  const modelName = ref(import.meta.env.VITE_MODEL_NAME ?? 'deepseek-chat');

  const persistPreferences = () => {
    saveAppPreferences({
      currentRole: currentRole.value,
      modelName: modelName.value
    });
  };

  const setRole = (roleId: string) => {
    currentRole.value = roleId;
    persistPreferences();
  };

  const setModel = (model: string) => {
    modelName.value = model;
    persistPreferences();
  };

  const hydrateConfig = () => {
    if (import.meta.env.VITE_AVAILABLE_ROLES) {
      availableRoles.value = JSON.parse(import.meta.env.VITE_AVAILABLE_ROLES);
    }

    if (import.meta.env.VITE_DEFAULT_ROLE) {
      currentRole.value = import.meta.env.VITE_DEFAULT_ROLE;
    }

    const persisted = loadAppPreferences();
    currentRole.value = persisted.currentRole;
    modelName.value = persisted.modelName;
    persistPreferences();
  };

  return {
    currentRole,
    availableRoles,
    apiBaseUrl,
    apiKey,
    modelName,
    setRole,
    setModel,
    hydrateConfig
  };
});
