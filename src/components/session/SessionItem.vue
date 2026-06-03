<script setup lang="ts">
interface SessionItemProps {
  title: string;
  active?: boolean;
}

withDefaults(defineProps<SessionItemProps>(), {
  active: false
});

const emit = defineEmits<{
  select: [];
}>();
</script>

<template>
  <button
    type="button"
    class="session-item"
    :class="{ 'is-active': active }"
    :aria-current="active ? 'page' : undefined"
    @click="emit('select')"
  >
    {{ title }}
  </button>
</template>

<style scoped>
.session-item {
  width: 100%;
  text-align: left;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 8px 10px;
  background: transparent;
  font: inherit;
  transition: background 0.15s ease, border-color 0.15s ease;
}

.session-item:hover {
  background: var(--color-bg);
}

.session-item.is-active {
  border-color: var(--color-text);
  background: var(--color-bg);
  font-weight: 600;
}
</style>
