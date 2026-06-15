/**
 * UI 界面状态 Store（Pinia 全局数据仓库）
 * 管理：主题（浅/深）、侧边栏收起、手机抽屉
 * 其中「主题」和「侧边栏」会保存到 localStorage，刷新后保留
 */

// 从 pinia 引入 defineStore，用来定义一个全局 store
import { defineStore } from 'pinia';
// 从 vue 引入 ref，创建响应式变量（改值后界面自动更新）
import { ref } from 'vue';

// 引入主题类型：只能是 'light' 或 'dark'（仅类型，编译后不存在）
import type { ThemeMode } from '@/types/ui';
// 引入读写 localStorage 里 UI 设置的工具函数
import { loadUiState, saveUiState } from '@/utils/storage';

/**
 * 把当前主题真正应用到页面上
 * 修改 <html> 的 data-theme 属性，theme.css 根据它切换颜色变量
 */
const applyThemeToDocument = (theme: ThemeMode) => {
  // document.documentElement 就是 <html> 标签
  // dataset.theme 对应 HTML 属性 data-theme
  document.documentElement.dataset.theme = theme;
};

// 定义名为 'ui' 的 store，组件里通过 useUiStore() 使用
export const useUiStore = defineStore('ui', () => {
  // 当前主题，默认浅色 'light'
  const theme = ref<ThemeMode>('light');
  // 侧边栏是否收起，false = 展开
  const sidebarCollapsed = ref(false);
  // 手机端左侧会话列表抽屉是否打开
  const isMobileDrawerOpen = ref(false);

  /** 把需要长期记住的设置写入 localStorage */
  const persist = () => {
    // 调用 storage 工具，只保存主题和侧边栏状态
    saveUiState({
      // ref 要用 .value 才能读到真实值
      theme: theme.value,
      sidebarCollapsed: sidebarCollapsed.value
    });
  };

  /** 应用启动时调用（main.ts）：从 localStorage 恢复 UI 状态 */
  const loadFromStorage = () => {
    // 从浏览器本地读取上次保存的 UI 设置
    const persisted = loadUiState();
    // 恢复主题
    theme.value = persisted.theme;
    // 恢复侧边栏是否收起
    sidebarCollapsed.value = persisted.sidebarCollapsed;
    // 让页面颜色与恢复的主题一致
    applyThemeToDocument(theme.value);
  };

  /** 切换浅色 ↔ 深色，并保存 */
  const toggleTheme = () => {
    // 若是 light 则变 dark，否则变 light
    theme.value = theme.value === 'light' ? 'dark' : 'light';
    // 立即更新页面上的主题样式
    applyThemeToDocument(theme.value);
    // 写入 localStorage
    persist();
  };

  /** 侧边栏展开 ↔ 收起，并保存 */
  const toggleSidebar = () => {
    // 取反：true 变 false，false 变 true
    sidebarCollapsed.value = !sidebarCollapsed.value;
    // 写入 localStorage
    persist();
  };

  /** 打开手机端会话列表抽屉（AppHeader 菜单按钮会调） */
  const openMobileDrawer = () => {
    isMobileDrawerOpen.value = !isMobileDrawerOpen.value;
  };

  /** 关闭手机端抽屉（点遮罩、切换会话等时会调） */
  const closeMobileDrawer = () => {
    isMobileDrawerOpen.value = false;
  };

  // 把状态和方法暴露出去，供组件和其他 store 使用
  return {
    theme,              // 当前主题（响应式）
    sidebarCollapsed,   // 侧边栏是否收起
    isMobileDrawerOpen, // 手机抽屉是否打开
    toggleTheme,        // 切换主题
    toggleSidebar,      // 切换侧边栏
    openMobileDrawer,   // 打开抽屉
    closeMobileDrawer,  // 关闭抽屉
    loadFromStorage     // 从本地恢复（启动时用）
  };
});
