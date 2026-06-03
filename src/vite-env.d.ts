/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_API_KEY: string;
  readonly VITE_MODEL_NAME: string;
  readonly VITE_DEFAULT_ROLE?: string;
  readonly VITE_AVAILABLE_ROLES?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
