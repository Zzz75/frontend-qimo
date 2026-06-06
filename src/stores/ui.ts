import { defineStore } from 'pinia';
import { ref } from 'vue';

import type { ThemeMode } from '@/types/ui';
import { loadUiState, saveUiState } from '@/utils/storage';

const applyThemeToDocument = (theme: ThemeMode) => {
  document.documentElement.dataset.theme = theme;
};

export const useUiStore = defineStore('ui', () => {
  const theme = ref<ThemeMode>('light');
  const sidebarCollapsed = ref(false);
  const isMobileDrawerOpen = ref(false);
  const globalLoading = ref(false);

  const persist = () => {
    saveUiState({
      theme: theme.value,
      sidebarCollapsed: sidebarCollapsed.value
    });
  };

  const loadFromStorage = () => {
    const persisted = loadUiState();
    theme.value = persisted.theme;
    sidebarCollapsed.value = persisted.sidebarCollapsed;
    applyThemeToDocument(theme.value);
  };

  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light';
    applyThemeToDocument(theme.value);
    persist();
  };

  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value;
    persist();
  };

  const openMobileDrawer = () => {
    isMobileDrawerOpen.value = true;
  };

  const closeMobileDrawer = () => {
    isMobileDrawerOpen.value = false;
  };

  const setGlobalLoading = (flag: boolean) => {
    globalLoading.value = flag;
  };

  return {
    theme,
    sidebarCollapsed,
    isMobileDrawerOpen,
    globalLoading,
    toggleTheme,
    toggleSidebar,
    openMobileDrawer,
    closeMobileDrawer,
    setGlobalLoading,
    loadFromStorage
  };
});
