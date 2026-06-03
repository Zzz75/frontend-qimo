import apiClient from './client';
import type { ChatRequest, ChatResponse } from './types';

export const createChatCompletion = async (
  payload: ChatRequest
): Promise<ChatResponse> => {
  const { data } = await apiClient.post<ChatResponse>('/chat/completions', payload);
  return data;
};

export const createChatStream = async (_payload: ChatRequest): Promise<void> => {};
