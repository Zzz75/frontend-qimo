/**
 * 生成唯一 ID
 * 每条消息、每个会话都需要不重复的 id
 */

// crypto.randomUUID()：浏览器内置 API，生成标准 UUID 字符串
export const createId = (): string => crypto.randomUUID();
