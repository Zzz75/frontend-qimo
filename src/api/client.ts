import axios from 'axios';
import type { AxiosError } from 'axios';

import type { ApiError } from './types';
import { createId } from '@/utils/id';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL?.trim() ?? '',
  timeout: 30000
});

export const getAuthHeaders = (): Record<string, string> => {
  const apiKey = import.meta.env.VITE_API_KEY?.trim();
  if (!apiKey) {
    return {};
  }

  return {
    Authorization: `Bearer ${apiKey}`
  };
};

export const normalizeApiError = (error: unknown): ApiError => {
  const fallback: ApiError = {
    code: 'UNKNOWN_ERROR',
    message: '请求失败，请稍后重试'
  };

  if (!axios.isAxiosError(error)) {
    if (error instanceof Error && error.message.trim()) {
      return {
        ...fallback,
        message: error.message.trim()
      };
    }
    return fallback;
  }

  const axiosError = error as AxiosError<{ error?: Partial<ApiError>; message?: string }>;
  const status = axiosError.response?.status;
  const payload = axiosError.response?.data;
  const apiError = payload?.error;

  const message =
    apiError?.message?.trim() ||
    payload?.message?.trim() ||
    axiosError.message.trim() ||
    fallback.message;
  const code = apiError?.code?.trim() || `HTTP_${status ?? 'ERROR'}`;

  return {
    code,
    message,
    status,
    details: payload
  };
};

apiClient.interceptors.request.use((config) => {
  const headers = axios.AxiosHeaders.from((config.headers ?? {}) as any);
  headers.set('Accept', 'application/json');
  headers.set('Content-Type', 'application/json');
  headers.set('X-Request-Id', createId());

  const authHeaders = getAuthHeaders();
  Object.entries(authHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });

  config.headers = headers;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(normalizeApiError(error))
);

export default apiClient;
