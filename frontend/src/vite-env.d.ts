/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_CRYPTO_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
