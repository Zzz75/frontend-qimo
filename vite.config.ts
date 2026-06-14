/**
 * Vite 构建工具配置
 * Vite：开发时快速启动、打包生产环境的工具（类似后端的构建脚本）
 */

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue'; // 让 Vite 能编译 .vue 文件
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [vue()], // 启用 Vue 插件
  resolve: {
    alias: {
      // 路径别名：代码里写 @/xxx 等价于 src/xxx，不用写 ../../../
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
});
