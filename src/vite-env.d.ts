/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ADSENSE_CLIENT_ID?: string
  readonly VITE_HIDE_AD_PLACEHOLDER?: string
  readonly VITE_COUPANG_BANNER_ID?: string
  readonly VITE_COUPANG_TRACKING_CODE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
