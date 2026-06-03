<script setup lang="ts">
interface SessionItemProps {
  title: string;
  active?: boolean;
  showMenu?: boolean;
}

withDefaults(defineProps<SessionItemProps>(), {
  active: false,
  showMenu: true
});

const emit = defineEmits<{
  select: [];
  manage: [];
}>();
</script>

<template>
  <div class="session-item-wrap" :class="{ 'is-active': active }">
    <button
      type="button"
      class="session-item__main"
      :aria-current="active ? 'page' : undefined"
      @click="emit('select')"
    >
      <span class="session-item__title">{{ title }}</span>
    </button>
    <button
      v-if="showMenu"
      type="button"
      class="session-item__delete"
      :aria-label="`删除会话 ${title}`"
      @click.stop="emit('manage')"
    >
      删除
    </button>
  </div>
</template>

<style scoped>
.session-item-wrap {
  display: flex;
  align-items: center;
  gap: 0;
  flex: 1;
  min-width: 0;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: transparent;
  overflow: hidden;
  transition: background 0.15s ease, border-color 0.15s ease;
}

.session-item-wrap:hover {
  background: var(--color-bg);
}

.session-item-wrap.is-active {
  border-color: var(--color-text);
  background: var(--color-bg);
}

.session-item__main {
  flex: 1;
  min-width: 0;
  border: none;
  background: transparent;
  text-align: left;
  font: inherit;
  font-weight: inherit;
  padding: 8px 10px;
  cursor: pointer;
  color: inherit;
}

.session-item-wrap.is-active .session-item__main {
  font-weight: 600;
}

.session-item__title {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.session-item__delete {
  flex-shrink: 0;
  align-self: stretch;
  display: inline-flex;
  align-items: center;
  border: none;
  border-left: 1px solid var(--color-border);
  border-radius: 0;
  background: transparent;
  color: #d93025;
  font: inherit;
  font-size: 12px;
  line-height: 1;
  padding: 0 12px;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}

.session-item__delete:hover {
  background: color-mix(in srgb, #d93025 12%, transparent);
  color: #c5221f;
}

.session-item-wrap.is-active .session-item__delete {
  border-left-color: color-mix(in srgb, var(--color-text) 25%, var(--color-border));
}
</style>
