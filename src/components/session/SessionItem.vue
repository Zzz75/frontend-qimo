<!--
  单个会话条目 SessionItem
  侧边栏里的一行：点击切换会话，右侧有删除按钮
-->

<script setup lang="ts">
interface SessionItemProps {
  title: string;      // 会话标题
  active?: boolean;   // 是否为当前选中会话
  showMenu?: boolean; // 是否显示删除按钮（批量模式下隐藏）
}

withDefaults(defineProps<SessionItemProps>(), {
  active: false,
  showMenu: true
});

// select：点击主区域切换会话；manage：点击删除
const emit = defineEmits<{
  select: [];
  manage: [];
}>();
</script>

<template>
  <div class="session-item-wrap" :class="{ 'is-active': active }">
    <!-- 点击标题区域 → 切换到这个会话 -->
    <button
      type="button"
      class="session-item__main"
      :aria-current="active ? 'page' : undefined"
      @click="emit('select')"
    >
      <span class="session-item__title">{{ title }}</span>
    </button>
    <!-- 删除按钮；@click.stop 阻止冒泡，避免同时触发 select -->
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
  text-overflow: ellipsis; /* 标题过长显示省略号 */
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
