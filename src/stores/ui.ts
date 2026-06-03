import { defineStore } from 'pinia';
import { ref } from 'vue';

import type { ThemeMode } from '@/types/ui';

export const useUiStore = defineStore('ui', () => {
  const theme = ref<ThemeMode>('light');
  const sidebarCollapsed = ref(false);
  const isMobileDrawerOpen = ref(false);
  const globalLoading = ref(false);

  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = theme.value;
  };

  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value;
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
    setGlobalLoading
  };
});
