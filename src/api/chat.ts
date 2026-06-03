import apiClient, { getAuthHeaders, normalizeApiError } from './client';
import type { ApiError, ChatRequest, ChatResponse } from './types';
import { createId } from '@/utils/id';

export interface ChatStreamHandlers {
  onChunk: (chunk: string) => void;
  onDone: () => void;
  onError: (message: string) => void;
}

const CHAT_COMPLETION_PATH = '/chat/completions';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const extractDeltaContent = (delta: unknown): string => {
  if (typeof delta === 'string') {
    return delta;
  }

  if (!isRecord(delta)) {
    return '';
  }

  const directContent = delta.content;
  if (typeof directContent === 'string') {
    return directContent;
  }

  if (Array.isArray(directContent)) {
    return directContent
      .map((item) => (isRecord(item) && typeof item.text === 'string' ? item.text : ''))
      .join('');
  }

  const reasoningContent = delta.reasoning_content;
  if (typeof reasoningContent === 'string') {
    return reasoningContent;
  }

  return '';
};

const extractChunkContent = (payload: unknown): string => {
  if (!isRecord(payload)) {
    return '';
  }

  if (typeof payload.content === 'string') {
    return payload.content;
  }

  const choices = payload.choices;
  if (!Array.isArray(choices) || choices.length === 0) {
    return '';
  }

  const firstChoice = choices[0];
  if (!isRecord(firstChoice)) {
    return '';
  }

  const deltaContent = extractDeltaContent(firstChoice.delta);
  if (deltaContent) {
    return deltaContent;
  }

  if (isRecord(firstChoice.message) && typeof firstChoice.message.content === 'string') {
    return firstChoice.message.content;
  }

  return '';
};

const hasFinishSignal = (payload: unknown): boolean => {
  if (!isRecord(payload)) {
    return false;
  }

  const choices = payload.choices;
  if (!Array.isArray(choices) || choices.length === 0) {
    return false;
  }

  return choices.some(
    (item) =>
      isRecord(item) && typeof item.finish_reason === 'string' && item.finish_reason.length > 0
  );
};

const parseSseEventData = (rawEvent: string): string => {
  const lines = rawEvent.split(/\r?\n/);
  const dataLines = lines
    .map((line) => line.trim())
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.slice(5).trim());

  return dataLines.join('\n');
};

const getChatCompletionUrl = (): string => {
  const baseURL = apiClient.defaults.baseURL?.trim();
  if (!baseURL) {
    return CHAT_COMPLETION_PATH;
  }

  return new URL(CHAT_COMPLETION_PATH, `${baseURL.replace(/\/+$/, '')}/`).toString();
};

const parseStreamHttpError = async (response: Response): Promise<ApiError> => {
  try {
    const rawText = await response.text();
    const payload = JSON.parse(rawText) as { error?: Partial<ApiError>; message?: string };
    return {
      code: payload.error?.code?.trim() || `HTTP_${response.status}`,
      message:
        payload.error?.message?.trim() || payload.message?.trim() || `请求失败（${response.status}）`,
      status: response.status,
      details: payload
    };
  } catch {
    return {
      code: `HTTP_${response.status}`,
      message: `请求失败（${response.status}）`,
      status: response.status
    };
  }
};

export const createChatCompletion = async (
  payload: ChatRequest
): Promise<ChatResponse> => {
  try {
    const { data } = await apiClient.post<ChatResponse>(CHAT_COMPLETION_PATH, payload);
    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
};

export const createChatStream = async (
  payload: ChatRequest,
  handlers: ChatStreamHandlers
): Promise<void> => {
  try {
    const response = await fetch(getChatCompletionUrl(), {
      method: 'POST',
      headers: {
        Accept: 'text/event-stream',
        'Content-Type': 'application/json',
        'X-Request-Id': createId(),
        ...getAuthHeaders()
      },
      body: JSON.stringify({
        ...payload,
        stream: true
      })
    });

    if (!response.ok) {
      const apiError = await parseStreamHttpError(response);
      handlers.onError(apiError.message);
      return;
    }

    if (!response.body) {
      handlers.onError('流式响应不可用，请稍后重试');
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let isCompleted = false;

    while (!isCompleted) {
      const { value, done } = await reader.read();
      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split(/\r?\n\r?\n/);
      buffer = events.pop() ?? '';

      for (const rawEvent of events) {
        const eventData = parseSseEventData(rawEvent);
        if (!eventData) {
          continue;
        }

        if (eventData === '[DONE]') {
          handlers.onDone();
          isCompleted = true;
          break;
        }

        try {
          const parsedPayload = JSON.parse(eventData) as unknown;
          const chunk = extractChunkContent(parsedPayload);
          if (chunk) {
            handlers.onChunk(chunk);
          }

          if (hasFinishSignal(parsedPayload)) {
            handlers.onDone();
            isCompleted = true;
            break;
          }
        } catch {
          handlers.onChunk(eventData);
        }
      }
    }

    if (!isCompleted) {
      const finalChunk = decoder.decode();
      if (finalChunk) {
        buffer += finalChunk;
      }

      const remainingData = parseSseEventData(buffer);
      if (remainingData && remainingData !== '[DONE]') {
        try {
          const parsedPayload = JSON.parse(remainingData) as unknown;
          const chunk = extractChunkContent(parsedPayload);
          if (chunk) {
            handlers.onChunk(chunk);
          }
        } catch {
          handlers.onChunk(remainingData);
        }
      }

      handlers.onDone();
    }
  } catch (error) {
    const apiError = normalizeApiError(error);
    handlers.onError(apiError.message);
  }
};
