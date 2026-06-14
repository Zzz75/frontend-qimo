/**
 * 与后端 API 交互时用到的数据结构定义
 * 前端发请求、收响应时按这些形状组织数据
 */

// 发给后端的单条消息（比前端 ChatMessage 简单，没有 id、时间戳）
export interface ChatRequestMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// 聊天补全请求的完整 body
export interface ChatRequest {
  model: string;                    // 使用的 AI 模型名
  messages: ChatRequestMessage[];   // 对话历史
  stream?: boolean;                 // 是否流式返回（逐字输出）
}

// 非流式接口的一次性响应（本项目主要用流式，此类型备用）
export interface ChatResponse {
  id: string;
  content: string;
  createdAt: number;
}

// 流式响应里每一块数据的形状
export interface StreamChunk {
  contentPart: string;  // 本块文本片段
  isDone: boolean;      // 是否已结束
}

// 统一的 API 错误格式，方便界面显示
export interface ApiError {
  code: string;       // 错误码
  message: string;    // 给人看的错误说明
  status?: number;    // HTTP 状态码，如 401、500
  details?: unknown;  // 原始错误详情，调试用
}
