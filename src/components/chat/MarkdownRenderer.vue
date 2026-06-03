<script setup lang="ts">
import { computed } from 'vue';
import { marked } from 'marked';

interface MarkdownRendererProps {
  content: string;
}

const props = defineProps<MarkdownRendererProps>();

const htmlContent = computed(() => marked.parse(props.content));
</script>

<template>
  <div class="markdown-body" v-html="htmlContent"></div>
</template>
