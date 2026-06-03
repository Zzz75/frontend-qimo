import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';
import { useAppStore } from './stores/app';

import './assets/styles/reset.css';
import './assets/styles/theme.css';
import './assets/styles/markdown.css';
import './assets/styles/hljs.css';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

useAppStore(pinia).hydrateConfig();

app.mount('#app');
