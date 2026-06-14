/**
 * 路由配置
 * 作用：把「网址路径」和「要显示的页面组件」对应起来
 * 例如：访问 / → 显示聊天页；访问不存在的路径 → 显示 404 页
 */

// createRouter：创建路由实例；createWebHistory：使用浏览器真实 URL（无 # 号）
import { createRouter, createWebHistory } from 'vue-router';

// 创建并配置路由
const router = createRouter({
  history: createWebHistory(), // 使用 HTML5 History 模式，地址栏像普通网站
  routes: [
    // routes：路由表，每一项是一条规则
    {
      path: '/',                              // 访问根路径 /
      name: 'chat',                           // 路由名称，代码里可以用 name 跳转
      component: () => import('@/views/ChatView.vue') // 懒加载：用到时才下载聊天页
    },
    {
      path: '/:pathMatch(.*)*',               // 匹配所有未定义的路径（404）
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue')
    }
  ]
});

// 导出路由，供 main.ts 里 app.use(router) 使用
export default router;
