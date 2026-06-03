<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const goHome = () => {
  router.push('/');
};
</script>

<template>
  <main class="not-found">
    <h1>404</h1>
    <p>页面不存在</p>
    <button type="button" @click="goHome">返回首页</button>
  </main>
</template>

<style scoped>
.not-found {
  min-height: 100vh;
  display: grid;
  place-content: center;
  gap: 8px;
  text-align: center;
}
</style>
