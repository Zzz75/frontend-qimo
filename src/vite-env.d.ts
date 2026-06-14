/**
 * TypeScript 类型声明：环境变量
 * 这不是运行时代码，只给编辑器/编译器看，避免写 import.meta.env 时报错
 */

/// 引用 Vite 自带的类型定义
/// <reference types="vite/client" />

// 描述 .env 文件里可以有哪些以 VITE_ 开头的变量
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;  // 后端 API 地址
  readonly VITE_API_KEY: string;       // 调用 API 的密钥
  readonly VITE_MODEL_NAME: string;    // 默认 AI 模型名称
}

// 扩展 ImportMeta，让 import.meta.env 有上面的类型
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
