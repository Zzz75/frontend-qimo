/**
 * 会话（聊天窗口）摘要类型
 * 侧边栏列表里每一项就是一个 SessionSummary，不含具体消息内容
 */

export interface SessionSummary {
  id: string;        // 会话唯一 ID
  title: string;     // 显示在侧边栏的标题（如「新会话」或首条消息摘要）
  updatedAt: number; // 最后更新时间，用于排序（新的在前）
}
