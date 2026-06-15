/**
 * 聊天相关 API
 * - createChatCompletion：一次性返回完整回复（备用）
 * - createChatStream：SSE 流式，AI 回复逐字出现（本项目主要用这个）
 */

import apiClient, { getAuthHeaders } from './client';
import type { ChatRequest, ChatResponse } from './types';

/** 流式回调：收到一块文字 / 结束 / 出错 */
export interface ChatStreamHandlers {
  onChunk: (chunk: string) => void;       // 每收到一段文字
  onDone: () => void;                     // 流结束
  onError: (message: string) => void;     // 出错
}

// 聊天补全接口路径（相对 baseURL）
const CHAT_COMPLETION_PATH = '/chat/completions';
const CHAT_REQUEST_FAILED = '请求失败';

// 流式 JSON 里 choices 的结构（兼容 OpenAI 风格 API）
interface StreamChoice {
  delta?: { content?: string };   // 本块增量文本
  finish_reason?: string | null;  // 结束原因，有值表示流结束
}

interface StreamPayload {
  choices?: StreamChoice[];
  error?: { message?: string; code?: string };
}

interface ErrorResponsePayload extends StreamPayload {
  message?: string;
}

/** 从非 2xx 响应里尽量提取后端返回的错误信息 */
const readErrorMessage = async (response: Response): Promise<string> => {
  try {
    const payload = await response.json() as ErrorResponsePayload;
    return payload.error?.message ?? payload.message ?? CHAT_REQUEST_FAILED;
  } catch {
    return CHAT_REQUEST_FAILED;
  }
};

/** 从流式 JSON 里取出文本内容 */
const extractChunkContent = (payload: StreamPayload): string =>
  payload.choices?.[0]?.delta?.content ?? '';

/**
 * 解析 SSE（Server-Sent Events）事件
 * SSE 每行以 data: 开头，这里把多行 data 拼成一条 JSON 字符串
 */
const parseSseEventData = (rawEvent: string): string =>
  rawEvent
    .split(/\r?\n/)                              // 按行拆分
    .filter((line) => line.startsWith('data:'))  // 只保留 data: 行
    .map((line) => line.slice(5).trim())         // 去掉 "data:" 前缀
    .join('\n');

/** 拼出完整的聊天接口 URL（baseURL + 路径） */
const getChatCompletionUrl = (): string => {
  const baseURL = apiClient.defaults.baseURL!;
  return new URL(CHAT_COMPLETION_PATH, baseURL).toString();
};

/** 非流式：等 AI 全部生成完再一次返回（本项目 UI 主要用流式） */
export const createChatCompletion = async (payload: ChatRequest): Promise<ChatResponse> => {
  const { data } = await apiClient.post<ChatResponse>(CHAT_COMPLETION_PATH, payload);
  return data;
};

/**
 * 流式聊天：用 fetch 读 SSE 流，边读边调用 onChunk
 * 不能用 axios 读流，所以这里单独用 fetch + ReadableStream
 */
export const createChatStream = async (
  payload: ChatRequest,
  handlers: ChatStreamHandlers
): Promise<void> => {
  // 发起 POST，要求返回 text/event-stream
  const response = await fetch(getChatCompletionUrl(), {
    method: 'POST',
    headers: {
      Accept: 'text/event-stream',       // 告诉服务器：我要 SSE 流
      'Content-Type': 'application/json',
      ...getAuthHeaders()                 // 带上 API Key
    },
    body: JSON.stringify({ ...payload, stream: true }) // 强制开启 stream
  });

  if (!response.ok) {
    handlers.onError(await readErrorMessage(response));
    return;
  }

  if (!response.body) {
    handlers.onError(CHAT_REQUEST_FAILED);
    return;
  }

  const reader = response.body!.getReader(); // 流读取器，像读水管里的水
  const decoder = new TextDecoder('utf-8');    // 二进制转 UTF-8 字符串
  let buffer = '';                           // 未处理完的半截数据

  // 循环读流，直到 done 为 true
  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      break; // 流读完了
    }
    buffer += decoder.decode(value, { stream: true });
    // SSE 事件之间用空行分隔
    const events = buffer.split(/\r?\n\r?\n/);
    buffer = events.pop()!; // 最后一段可能不完整，留到下次

    for (const rawEvent of events) {
      const eventData = parseSseEventData(rawEvent);
      if (!eventData) {
        continue; // 空事件跳过
      }

      // OpenAI 兼容协议：收到 [DONE] 表示流结束
      if (eventData === '[DONE]') {
        handlers.onDone(); // OpenAI 风格结束标记
        return;
      }

      const parsedPayload = JSON.parse(eventData) as StreamPayload;
      if (parsedPayload.error?.message) {
        handlers.onError(parsedPayload.error.message);
        return;
      }

      const chunk = extractChunkContent(parsedPayload);
      if (chunk) {
        handlers.onChunk(chunk); // 把本段文字交给 UI 显示
      }

      // finish_reason 出现说明本轮生成已结束
      if (parsedPayload.choices?.[0]?.finish_reason) {
        handlers.onDone(); // 有 finish_reason 也表示结束
        return;
      }
    }
  }

  // 处理缓冲区里可能剩的最后一点数据
  buffer += decoder.decode();
  if (buffer.trim()) {
    const eventData = parseSseEventData(buffer);
    if (eventData && eventData !== '[DONE]') {
      try {
        const parsedPayload = JSON.parse(eventData) as StreamPayload;
        if (parsedPayload.error?.message) {
          handlers.onError(parsedPayload.error.message);
          return;
        }

        const chunk = extractChunkContent(parsedPayload);
        if (chunk) {
          handlers.onChunk(chunk);
        }
      } catch {
        handlers.onError(CHAT_REQUEST_FAILED);
        return;
      }
    }
  }

  handlers.onDone(); // 兜底：通知结束
};
