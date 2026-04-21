/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ADSENSE_CLIENT_ID?: string
  readonly VITE_HIDE_AD_PLACEHOLDER?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
