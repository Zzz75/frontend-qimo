<!--
  根组件 App.vue
  作用：根据当前网址，显示对应的页面（由路由决定）
  本项目的页面很少，主要就是聊天页 ChatView
-->

<script setup lang="ts">
// script setup：Vue 3 的写法，这里写的变量/函数可以直接在模板里用

// 从 vue-router 引入 RouterView：一个占位符，会替换成当前路由对应的页面组件
import { RouterView } from 'vue-router';
</script>

<template>
  <!-- 模板：描述页面长什么样 -->
  <!-- RouterView 会根据网址渲染对应页面，例如 / 显示 ChatView -->
  <RouterView />
</template>

<!-- 本组件没有 style，样式由子页面和全局 CSS 负责 -->
