/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_PLATFORM_DB_READY?: string;
  readonly VITE_ENABLE_CLIENT_PORTAL?: string;
  readonly VITE_PERSONA_AI_ENABLED?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
