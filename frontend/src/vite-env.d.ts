/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the tidemark API. Unset → the app runs against in-memory mocks. */
  readonly VITE_API_BASE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
