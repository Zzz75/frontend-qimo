<!--
  404 页面：用户访问不存在的路径时显示
-->

<script setup lang="ts">
import { useRouter } from 'vue-router'; // 获取路由实例，用于编程式跳转

const router = useRouter();

/** 点击按钮回到首页（聊天页） */
const goHome = () => {
  router.push('/'); // 跳转到 path 为 / 的路由
};
</script>

<template>
  <main class="not-found">
    <h1>404</h1>
    <p>页面不存在呀</p>
    <button type="button" @click="goHome">返回首页</button>
  </main>
</template>

<style scoped>
/* 内容垂直水平居中 */
.not-found {
  min-height: 100vh;
  display: grid;
  place-content: center; /* 网格内容居中 */
  gap: 8px;
  text-align: center;
}
</style>
