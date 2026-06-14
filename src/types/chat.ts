/**
 * 聊天消息相关类型
 */

// 消息发送者角色：系统 / 用户 / AI 助手
export type ChatRole = 'system' | 'user' | 'assistant';

// 一条聊天消息的结构
export interface ChatMessage {
  id: string;         // 唯一标识，用于列表渲染的 key
  role: ChatRole;     // 谁发的这条消息
  content: string;    // 消息正文（可以是 Markdown）
  createdAt: number;  // 发送时间（Unix 毫秒时间戳）
}
