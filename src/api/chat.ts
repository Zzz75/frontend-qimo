import apiClient, { getAuthHeaders } from './client';
import type { ChatRequest, ChatResponse } from './types';
import { createId } from '@/utils/id';

export interface ChatStreamHandlers {
  onChunk: (chunk: string) => void;
  onDone: () => void;
  onError: (message: string) => void;
}

const CHAT_COMPLETION_PATH = '/chat/completions';

interface StreamChoice {
  delta?: { content?: string };
  finish_reason?: string | null;
}

interface StreamPayload {
  choices?: StreamChoice[];
}

const extractChunkContent = (payload: StreamPayload): string =>
  payload.choices?.[0]?.delta?.content ?? '';

const parseSseEventData = (rawEvent: string): string =>
  rawEvent
    .split(/\r?\n/)
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.slice(5).trim())
    .join('\n');

const getChatCompletionUrl = (): string => {
  const baseURL = apiClient.defaults.baseURL!;
  return new URL(CHAT_COMPLETION_PATH, `${baseURL.replace(/\/+$/, '')}/`).toString();
};

export const createChatCompletion = async (payload: ChatRequest): Promise<ChatResponse> => {
  const { data } = await apiClient.post<ChatResponse>(CHAT_COMPLETION_PATH, payload);
  return data;
};

export const createChatStream = async (
  payload: ChatRequest,
  handlers: ChatStreamHandlers
): Promise<void> => {
  const response = await fetch(getChatCompletionUrl(), {
    method: 'POST',
    headers: {
      Accept: 'text/event-stream',
      'Content-Type': 'application/json',
      'X-Request-Id': createId(),
      ...getAuthHeaders()
    },
    body: JSON.stringify({ ...payload, stream: true })
  });

  const reader = response.body!.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split(/\r?\n\r?\n/);
    buffer = events.pop()!;

    for (const rawEvent of events) {
      const eventData = parseSseEventData(rawEvent);
      if (!eventData) {
        continue;
      }

      if (eventData === '[DONE]') {
        handlers.onDone();
        return;
      }

      const parsedPayload = JSON.parse(eventData) as StreamPayload;
      const chunk = extractChunkContent(parsedPayload);
      if (chunk) {
        handlers.onChunk(chunk);
      }

      if (parsedPayload.choices?.[0]?.finish_reason) {
        handlers.onDone();
        return;
      }
    }
  }

  buffer += decoder.decode();
  if (buffer.trim()) {
    const eventData = parseSseEventData(buffer);
    if (eventData && eventData !== '[DONE]') {
      const parsedPayload = JSON.parse(eventData) as StreamPayload;
      const chunk = extractChunkContent(parsedPayload);
      if (chunk) {
        handlers.onChunk(chunk);
      }
    }
  }

  handlers.onDone();
};
