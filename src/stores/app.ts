import { defineStore } from 'pinia';
import { ref } from 'vue';

import { loadAppPreferences, saveAppPreferences } from '@/utils/storage';

export const useAppStore = defineStore('app', () => {
  const apiBaseUrl = ref(import.meta.env.VITE_API_BASE_URL);
  const apiKey = ref(import.meta.env.VITE_API_KEY);
  const modelName = ref(import.meta.env.VITE_MODEL_NAME ?? 'deepseek-chat');

  const persistPreferences = () => {
    saveAppPreferences({
      modelName: modelName.value
    });
  };

  const setModel = (model: string) => {
    modelName.value = model;
    persistPreferences();
  };

  const hydrateConfig = () => {
    const persisted = loadAppPreferences();
    modelName.value = persisted.modelName;
    persistPreferences();
  };

  return {
    apiBaseUrl,
    apiKey,
    modelName,
    setModel,
    hydrateConfig
  };
});
