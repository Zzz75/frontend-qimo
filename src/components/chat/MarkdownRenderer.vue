<!--
  Markdown 渲染器
  把 AI 回复里的 Markdown 文本（标题、列表、代码块等）转成 HTML 显示
-->

<script setup lang="ts">
import { computed } from 'vue';
import { useMarkdown } from '@/composables/useMarkdown';

interface MarkdownRendererProps {
  content: string; // 原始 Markdown 字符串
}

const props = defineProps<MarkdownRendererProps>();
const { renderMarkdown } = useMarkdown();

// 内容变化时重新解析 Markdown（computed 会自动缓存）
const htmlContent = computed(() => renderMarkdown(props.content));
</script>

<template>
  <!-- v-html：把 HTML 字符串插入 DOM（仅用于已消毒的内容） -->
  <div class="markdown-body" v-html="htmlContent"></div>
</template>
