/**
 * HTTP 客户端（基于 axios 库）
 * 作用：统一配置后端地址、超时、鉴权头、错误格式
 * 普通 JSON 请求走这里；流式聊天在 chat.ts 里用 fetch 单独处理
 */

import axios from 'axios';
import type { AxiosError } from 'axios';

import type { ApiError } from './types';
import { createId } from '@/utils/id';

// 创建 axios 实例，后续请求都基于它
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // 从 .env 读取后端根地址
  timeout: 30000                                 // 30 秒无响应则超时
});

/** 生成鉴权请求头：Bearer + API Key */
export const getAuthHeaders = (): Record<string, string> => ({
  Authorization: `Bearer ${import.meta.env.VITE_API_KEY}`
});

/**
 * 把 axios 抛出的各种错误，整理成统一的 ApiError 对象
 * 这样上层代码不用关心错误原始长什么样
 */
export const normalizeApiError = (error: unknown): ApiError => {
  const axiosError = error as AxiosError<{ error?: Partial<ApiError>; message?: string }>;
  const payload = axiosError.response?.data; // 服务端返回的 JSON body

  return {
    code: payload?.error?.code ?? `HTTP_${axiosError.response?.status}`,
    message: payload?.error?.message ?? payload?.message ?? axiosError.message,
    status: axiosError.response?.status,
    details: payload
  };
};

// 请求拦截器：每次发请求前自动执行，可改 headers
apiClient.interceptors.request.use((config) => {
  config.headers.set('Accept', 'application/json');       // 期望 JSON 响应
  config.headers.set('Content-Type', 'application/json'); // 发送 JSON body
  config.headers.set('X-Request-Id', createId());         // 唯一请求 ID，便于排查问题

  // 把鉴权头逐个设进去
  Object.entries(getAuthHeaders()).forEach(([key, value]) => {
    config.headers.set(key, value);
  });

  return config; // 必须返回 config，请求才会继续
});

// 响应拦截器：收到响应后执行；出错时统一转成 ApiError 再 reject
apiClient.interceptors.response.use(
  (response) => response,                              // 成功：原样返回
  (error) => Promise.reject(normalizeApiError(error))  // 失败：标准化后抛出
);

export default apiClient;
