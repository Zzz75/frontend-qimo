/**
 * 应用配置 Store（Pinia 全局数据仓库之一）
 * 管理：API 地址、密钥、当前 AI 模型名称
 * modelName 会持久化到 localStorage，刷新后保留
 */

import { defineStore } from 'pinia'; // Pinia 定义 store 的函数
import { ref } from 'vue';            // ref：响应式变量，改值后界面自动更新

import { loadAppPreferences, saveAppPreferences } from '@/utils/storage';

// defineStore('app', ...)：store 名字叫 'app'，组件里用 useAppStore() 访问
export const useAppStore = defineStore('app', () => {
  // 从 .env 环境变量读取，构建时注入
  const apiBaseUrl = ref(import.meta.env.VITE_API_BASE_URL);
  const apiKey = ref(import.meta.env.VITE_API_KEY);
  // ?? 表示：若 VITE_MODEL_NAME 为空则用默认值
  const modelName = ref(import.meta.env.VITE_MODEL_NAME ?? 'deepseek-v4-flash');

  /** 把当前 modelName 写入 localStorage */
  const persistPreferences = () => {
    saveAppPreferences({
      modelName: modelName.value // .value 是 ref 里真正的值
    });
  };

  /** 切换模型并保存 */
  const setModel = (model: string) => {
    modelName.value = model;
    persistPreferences();
  };

  /** 应用启动时调用（main.ts）：从 localStorage 恢复上次的模型名 */
  const hydrateConfig = () => {
    const persisted = loadAppPreferences();
    modelName.value = persisted.modelName;
    persistPreferences(); // 同步写回，保证存储格式一致
  };

  // 暴露给外部的属性和方法
  return {
    apiBaseUrl,
    apiKey,
    modelName,
    setModel,
    hydrateConfig
  };
});
