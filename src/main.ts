/**
 * 应用入口文件
 * 浏览器加载 index.html 后，会执行本文件
 * 流程：创建 Vue 应用 → 注册插件 → 恢复本地数据 → 挂载到页面
 */

// 从 vue 库引入 createApp，用来创建 Vue 应用实例
import { createApp } from 'vue';
// 从 pinia 库引入 createPinia，用来管理全局共享数据（类似全局变量仓库）
import { createPinia } from 'pinia';

// 根组件：整个应用最外层的「壳」
import App from './App.vue';
// 路由：决定访问不同网址时显示哪个页面
import router from './router';
// 四个「数据仓库」，分别存配置、界面、会话、聊天内容
import { useAppStore } from './stores/app';
import { useChatStore } from './stores/chat';
import { useSessionStore } from './stores/session';
import { useUiStore } from './stores/ui';

// 引入全局 CSS 样式文件（不需要导出，引入即生效）
import './assets/styles/reset.css';      // 清除浏览器默认样式
import './assets/styles/theme.css';      // 浅色/深色主题颜色
import './assets/styles/markdown.css';   // AI 回复里 Markdown 的样式
import './assets/styles/hljs.css';       // 代码块语法高亮样式

// 以 App.vue 为根，创建 Vue 应用
const app = createApp(App);
// 创建 Pinia 实例（全局状态管理器）
const pinia = createPinia();

// 把 Pinia 注册到应用，之后组件里可以用 useXxxStore()
app.use(pinia);
// 把路由注册到应用，之后可以用 router.push() 跳转页面
app.use(router);

// 下面四行：拿到各 store 的引用（传入 pinia 保证用的是同一个实例）
const appStore = useAppStore(pinia);           // 应用配置（API、模型名等）
const uiStore = useUiStore(pinia);             // 界面状态（主题、侧边栏等）
const sessionStore = useSessionStore(pinia);   // 会话列表
const chatStore = useChatStore(pinia);         // 聊天消息

// 从浏览器 localStorage 恢复上次保存的数据，避免刷新后丢失
appStore.hydrateConfig();              // 恢复模型名称等配置
uiStore.loadFromStorage();             // 恢复主题、侧边栏状态
sessionStore.loadFromStorage();        // 恢复会话列表
chatStore.loadFromStorage();           // 恢复各会话的消息记录

// 把 Vue 应用挂载到 index.html 里的 <div id="app">，界面开始显示
app.mount('#app');
