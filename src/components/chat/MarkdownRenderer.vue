<script setup lang="ts">
import { computed } from 'vue';
import { useMarkdown } from '@/composables/useMarkdown';

interface MarkdownRendererProps {
  content: string;
}

const props = defineProps<MarkdownRendererProps>();
const { renderMarkdown } = useMarkdown();

const htmlContent = computed(() => renderMarkdown(props.content));
</script>

<template>
  <div class="markdown-body" v-html="htmlContent"></div>
</template>
