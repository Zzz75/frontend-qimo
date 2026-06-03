export interface ChatRequestMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  model: string;
  messages: ChatRequestMessage[];
  stream?: boolean;
}

export interface ChatResponse {
  id: string;
  content: string;
  createdAt: number;
}

export interface StreamChunk {
  contentPart: string;
  isDone: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  status?: number;
  details?: unknown;
}
