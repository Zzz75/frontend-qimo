import { defineStore } from 'pinia';
import { ref } from 'vue';

import type { RoleOption } from '@/types/chat';

const DEFAULT_ROLE_OPTIONS: RoleOption[] = [
  {
    id: 'default',
    label: '通用助手',
    description: '默认 AI 助手角色'
  }
];

const parseRoleOptions = (rawRoles: string | undefined): RoleOption[] => {
  if (!rawRoles) {
    return DEFAULT_ROLE_OPTIONS;
  }

  try {
    const parsedRoles = JSON.parse(rawRoles) as RoleOption[];
    const normalizedRoles = parsedRoles.filter(
      (item) =>
        typeof item?.id === 'string' &&
        item.id.trim().length > 0 &&
        typeof item?.label === 'string' &&
        item.label.trim().length > 0
    );

    return normalizedRoles.length > 0 ? normalizedRoles : DEFAULT_ROLE_OPTIONS;
  } catch {
    return DEFAULT_ROLE_OPTIONS;
  }
};

export const useAppStore = defineStore('app', () => {
  const currentRole = ref('default');
  const availableRoles = ref<RoleOption[]>(DEFAULT_ROLE_OPTIONS);
  const apiBaseUrl = ref('');
  const apiKey = ref('');
  const modelName = ref('deepseek-chat');

  const setRole = (roleId: string) => {
    const normalizedRoleId = roleId.trim();
    const hasRole = availableRoles.value.some((item) => item.id === normalizedRoleId);
    if (hasRole) {
      currentRole.value = normalizedRoleId;
    }
  };

  const setModel = (model: string) => {
    const normalizedModel = model.trim();
    if (normalizedModel) {
      modelName.value = normalizedModel;
    }
  };

  const hydrateConfig = () => {
    availableRoles.value = parseRoleOptions(import.meta.env.VITE_AVAILABLE_ROLES);
    apiBaseUrl.value = import.meta.env.VITE_API_BASE_URL?.trim() ?? '';
    apiKey.value = import.meta.env.VITE_API_KEY?.trim() ?? '';

    const envModelName = import.meta.env.VITE_MODEL_NAME?.trim();
    if (envModelName) {
      modelName.value = envModelName;
    }

    const envDefaultRole = import.meta.env.VITE_DEFAULT_ROLE?.trim() ?? 'default';
    if (availableRoles.value.some((item) => item.id === envDefaultRole)) {
      currentRole.value = envDefaultRole;
      return;
    }

    currentRole.value = availableRoles.value[0]?.id ?? 'default';
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
