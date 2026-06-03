import apiClient from './client';
import type { ChatRequest, ChatResponse } from './types';

export interface ChatStreamHandlers {
  onChunk: (chunk: string) => void;
  onDone: () => void;
  onError: (message: string) => void;
}

export const createChatCompletion = async (
  payload: ChatRequest
): Promise<ChatResponse> => {
  const { data } = await apiClient.post<ChatResponse>('/chat/completions', payload);
  return data;
};

export const createChatStream = async (
  _payload: ChatRequest,
  _handlers: ChatStreamHandlers
): Promise<void> => {
  // integrate-api-flow 阶段实现 SSE 流式解析
};
