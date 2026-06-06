import axios from 'axios';
import type { AxiosError } from 'axios';

import type { ApiError } from './types';
import { createId } from '@/utils/id';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000
});

export const getAuthHeaders = (): Record<string, string> => ({
  Authorization: `Bearer ${import.meta.env.VITE_API_KEY}`
});

export const normalizeApiError = (error: unknown): ApiError => {
  const axiosError = error as AxiosError<{ error?: Partial<ApiError>; message?: string }>;
  const payload = axiosError.response?.data;

  return {
    code: payload?.error?.code ?? `HTTP_${axiosError.response?.status}`,
    message: payload?.error?.message ?? payload?.message ?? axiosError.message,
    status: axiosError.response?.status,
    details: payload
  };
};

apiClient.interceptors.request.use((config) => {
  config.headers.set('Accept', 'application/json');
  config.headers.set('Content-Type', 'application/json');
  config.headers.set('X-Request-Id', createId());

  Object.entries(getAuthHeaders()).forEach(([key, value]) => {
    config.headers.set(key, value);
  });

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(normalizeApiError(error))
);

export default apiClient;
