<script setup lang="ts">
import AppHeader from '@/components/common/AppHeader.vue';
</script>

<template>
  <div class="settings-view">
    <AppHeader />
    <main class="settings-main">
      <h1>设置</h1>
      <p>基础框架页面，待接入业务配置。</p>
    </main>
  </div>
</template>

<style scoped>
.settings-view {
  min-height: 100vh;
}

.settings-main {
  padding: 24px;
}
</style>
