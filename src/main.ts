import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';
import { useAppStore } from './stores/app';
import { useChatStore } from './stores/chat';
import { useSessionStore } from './stores/session';
import { useUiStore } from './stores/ui';

import './assets/styles/reset.css';
import './assets/styles/theme.css';
import './assets/styles/markdown.css';
import './assets/styles/hljs.css';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

const appStore = useAppStore(pinia);
const uiStore = useUiStore(pinia);
const sessionStore = useSessionStore(pinia);
const chatStore = useChatStore(pinia);

appStore.hydrateConfig();
uiStore.loadFromStorage();
sessionStore.loadFromStorage();
chatStore.loadFromStorage();

app.mount('#app');
